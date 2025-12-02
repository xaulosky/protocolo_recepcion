/**
 * ProductosContent Component
 * Muestra el catálogo de productos de Cialo
 */

// Los productos se cargan desde productsData.js

function ProductosContent() {
    const { productBrand } = appState.getState();

    // Obtener marcas únicas
    const brands = ['Todas', ...new Set(productsData.map(p => p.brand))];

    // Filtrar productos por marca
    const filteredProducts = productBrand === 'Todas'
        ? productsData
        : productsData.filter(p => p.brand === productBrand);

    return `
        <div class="mb-6">
            <div class="flex items-center gap-3 mb-4">
                <i data-lucide="shopping-bag" class="text-purple-600 w-6 h-6"></i>
                <h3 class="text-xl font-bold text-slate-800">Catálogo de Productos</h3>
                <span class="text-sm text-slate-500">(${filteredProducts.length} productos)</span>
            </div>
            
            <div class="flex flex-wrap gap-2 mb-4 pb-2 border-b border-slate-100">
                ${brands.map(brand => renderBrandButton(brand, productBrand)).join('')}
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${filteredProducts.map(product => renderProduct(product)).join('')}
        </div>

        ${filteredProducts.length === 0 ? `
            <div class="text-center py-12 text-slate-400">
                <i data-lucide="package-x" class="w-16 h-16 mx-auto mb-3"></i>
                <p>No se encontraron productos</p>
            </div>
        ` : ''}
    `;
}

function renderBrandButton(brand, activeBrand) {
    const brandColors = {
        'Todas': {
            active: 'bg-slate-100 text-slate-800 border-slate-300',
            inactive: 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
            icon: 'grid-3x3'
        },
        'Avene': {
            active: 'bg-blue-100 text-blue-800 border-blue-300',
            inactive: 'bg-white text-blue-600 border-blue-200 hover:border-blue-300 hover:bg-blue-50',
            icon: 'droplet'
        },
        'Eucerin': {
            active: 'bg-teal-100 text-teal-800 border-teal-300',
            inactive: 'bg-white text-teal-600 border-teal-200 hover:border-teal-300 hover:bg-teal-50',
            icon: 'flask-conical'
        },
        'Obagi': {
            active: 'bg-purple-100 text-purple-800 border-purple-300',
            inactive: 'bg-white text-purple-600 border-purple-200 hover:border-purple-300 hover:bg-purple-50',
            icon: 'sparkles'
        },
        'Glisodin': {
            active: 'bg-amber-100 text-amber-800 border-amber-300',
            inactive: 'bg-white text-amber-600 border-amber-200 hover:border-amber-300 hover:bg-amber-50',
            icon: 'pill'
        }
    };

    const isActive = activeBrand === brand;
    const colors = brandColors[brand] || brandColors['Todas'];

    return `
        <button 
            data-brand="${brand}"
            class="px-4 py-2 rounded-lg text-sm font-bold transition-all border whitespace-nowrap flex items-center gap-2
            ${isActive ? colors.active : colors.inactive}"
        >
            <i data-lucide="${colors.icon}" class="w-4 h-4"></i>
            ${brand}
        </button>
    `;
}

function renderProduct(product) {
    const formattedPrice = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(product.price);

    return `
        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">${product.brand}</span>
                        <span class="text-xs text-slate-500">ID: ${product.id}</span>
                    </div>
                    <h4 class="font-bold text-slate-800 text-sm leading-tight">${product.name}</h4>
                </div>
            </div>
            
            <p class="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">${product.description}</p>
            
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
                <span class="text-lg font-bold text-purple-600">${formattedPrice}</span>
                <span class="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">${product.category}</span>
            </div>
        </div>
    `;
}

/**
 * Inicializa los event listeners de las marcas
 */
function initProductosContent() {
    const brandButtons = document.querySelectorAll('[data-brand]');

    brandButtons.forEach(button => {
        button.addEventListener('click', () => {
            const brand = button.getAttribute('data-brand');
            appState.setProductBrand(brand);
        });
    });
}
