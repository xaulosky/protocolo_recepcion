"""Uso: python verificar-envio.py <documento.xml> [esquema.xsd]

Verificador independiente, por el estándar, de un documento firmado para el SII
antes de subirlo: valida contra el XSD oficial y, para cada firma, recalcula el
digest de la referencia y verifica la firma RSA-SHA1 sobre el SignedInfo.

Sin segundo argumento valida como EnvioBOLETA. Para el reporte de consumo de
folios: python verificar-envio.py RCOF.xml ConsumoFolio_v10.xsd

Cómo canonicaliza: cada nodo se re-serializa con sus namespaces declarados y se
canonicaliza COMO RAÍZ con libxml2 (C14N 1.0). Equivale a la c14n inclusiva en
contexto porque estos documentos no tienen prefijos en alcance. Se hace así a
propósito: la c14n de SUBÁRBOLES de lxml está rota en algunos entornos (emite
xmlns="" fantasma o falla con "C14N failed") y signxml depende de ella, así que
ambos dan falsos negativos. RSA se verifica con openssl.

Requisitos: pip install lxml; openssl en el PATH (o el de Git para Windows).
"""
import sys, base64, hashlib, subprocess, tempfile, os, shutil
from lxml import etree

DS = 'http://www.w3.org/2000/09/xmldsig#'
AQUI = os.path.dirname(os.path.abspath(__file__))
# El XSD puede venir como segundo argumento (ruta absoluta o nombre dentro de docs/sii).
_xsd_arg = sys.argv[2] if len(sys.argv) > 2 else 'EnvioBOLETA_v11.xsd'
XSD = _xsd_arg if os.path.isabs(_xsd_arg) else os.path.join(AQUI, _xsd_arg)
OPENSSL = next(
    (p for p in [shutil.which('openssl'),
                 r'C:\Program Files\Git\mingw64\bin\openssl.exe',
                 r'C:\Program Files\Git\usr\bin\openssl.exe']
     if p and os.path.exists(p)),
    'openssl',
)

if len(sys.argv) < 2:
    print(__doc__)
    sys.exit(2)

tree = etree.parse(sys.argv[1])
root = tree.getroot()
schema = etree.XMLSchema(etree.parse(XSD))
xsd_ok = schema.validate(tree)
print('XSD oficial:', 'VALIDA' if xsd_ok else 'INVALIDA')
for e in schema.error_log:
    print('   *', e.message[:140])


NS_XSI = 'http://www.w3.org/2001/XMLSchema-instance'


def canon_como_raiz(el) -> bytes:
    # tostring(el) re-emite las declaraciones de namespace que el nodo necesita;
    # parseado como documento propio, la c14n de raíz de libxml2 es fiable.
    # Pero omite un prefijo en alcance que el nodo no usa (xsi, declarado en la
    # raíz para xsi:schemaLocation), y la C14N 1.0 en contexto SÍ lo emite en
    # el ápice: se inyecta a mano para reproducir la canonicalización real.
    raw = etree.tostring(el)
    fin = raw.index(b'>')
    if b'xmlns:xsi=' not in raw[:fin]:
        raw = raw[:fin] + b' xmlns:xsi="' + NS_XSI.encode() + b'"' + raw[fin:]
    return etree.tostring(etree.fromstring(raw), method='c14n', exclusive=False, with_comments=False)


def rsa_ok(pem: str, datos: bytes, firma: bytes) -> bool:
    with tempfile.TemporaryDirectory() as td:
        cp, pk, dp, sp = [os.path.join(td, n) for n in ('c.pem', 'pub.pem', 'd.bin', 's.bin')]
        open(cp, 'w').write(pem)
        open(dp, 'wb').write(datos)
        open(sp, 'wb').write(firma)
        pub = subprocess.run([OPENSSL, 'x509', '-in', cp, '-pubkey', '-noout'], capture_output=True, text=True).stdout
        open(pk, 'w').write(pub)
        r = subprocess.run([OPENSSL, 'dgst', '-sha1', '-verify', pk, '-signature', sp, dp], capture_output=True, text=True)
        return 'Verified OK' in r.stdout


firmas = root.findall('.//{%s}Signature' % DS)
ok = 0
for i, sig in enumerate(firmas, 1):
    ref = sig.find('.//{%s}Reference' % DS)
    uri = ref.get('URI').lstrip('#')
    objetivo = root.xpath('//*[@ID=$id]', id=uri)[0]
    # enveloped-signature no altera nada si la firma es hermana del nodo referenciado.
    assert sig not in list(objetivo.iter()), 'la firma está dentro de su nodo referenciado; este verificador no cubre ese caso'
    digest_calc = base64.b64encode(hashlib.sha1(canon_como_raiz(objetivo)).digest()).decode()
    d_ok = digest_calc == ref.find('{%s}DigestValue' % DS).text.strip()
    si = sig.find('{%s}SignedInfo' % DS)
    sv = base64.b64decode(''.join(sig.find('{%s}SignatureValue' % DS).text.split()))
    # El base64 puede venir partido en lineas (XMLDSig lo admite): se junta antes de rearmar el PEM.
    cb = ''.join(sig.find('.//{%s}X509Certificate' % DS).text.split())
    pem = '-----BEGIN CERTIFICATE-----\n' + '\n'.join(cb[j:j + 64] for j in range(0, len(cb), 64)) + '\n-----END CERTIFICATE-----\n'
    s_ok = rsa_ok(pem, canon_como_raiz(si), sv)
    print(f'  firma {i} ref=#{uri:7}  digest {"OK" if d_ok else "DIFIERE"}   RSA {"OK" if s_ok else "FALLA"}')
    ok += d_ok and s_ok

print('RESULTADO:', f'{ok}/{len(firmas)} firmas correctas por el estandar (libxml2 C14N 1.0 + openssl)')
sys.exit(0 if (ok == len(firmas) and xsd_ok) else 1)
