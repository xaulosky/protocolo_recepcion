/**
 * ProductosContent Component
 * Muestra el catálogo de productos de Cialo
 */

// Los productos se cargan desde productsData.js



function ProductosContent() {
    const { productBrand, productSearchTerm } = appState.getState();

    // Obtener marcas únicas
    const brands = ['Todas', ...new Set(productsData.map(p => p.brand))];

    // Filtrar productos por marca
    let filteredProducts = productBrand === 'Todas'
        ? productsData
        : productsData.filter(p => p.brand === productBrand);

    // Filtrar por término de búsqueda
    if (productSearchTerm) {
        const searchLower = productSearchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.category.toLowerCase().includes(searchLower) ||
            p.brand.toLowerCase().includes(searchLower)
        );
    }

    return `
        <div class="mb-6">
            <div class="flex items-center gap-3 mb-4">
                <i data-lucide="shopping-bag" class="text-purple-600 w-6 h-6"></i>
                <h3 class="text-xl font-bold text-slate-800">Catálogo de Productos</h3>
                <span id="productCount" class="text-sm text-slate-500">(${filteredProducts.length} productos)</span>
            </div>

            <!-- Buscador de Productos -->
            <div class="mb-4">
                <div class="relative">
                    <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"></i>
                    <input 
                        type="text" 
                        id="productSearchInput"
                        placeholder="Buscar productos por nombre, descripción, marca o categoría..."
                        value="${productSearchTerm}"
                        class="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                    <div id="clearSearchButton" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                        ${productSearchTerm ? `
                            <button 
                                onclick="clearProductSearch()"
                                class="text-slate-400 hover:text-slate-600"
                            >
                                <i data-lucide="x" class="w-4 h-4"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div class="flex flex-wrap gap-2 mb-4 pb-2 border-b border-slate-100">
                ${brands.map(brand => renderBrandButton(brand, productBrand)).join('')}
            </div>
        </div>

        <div id="productsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${filteredProducts.map(product => renderProduct(product)).join('')}
        </div>

        <div id="noResultsMessage">
            ${filteredProducts.length === 0 ? `
                <div class="text-center py-12 text-slate-400">
                    <i data-lucide="package-x" class="w-16 h-16 mx-auto mb-3"></i>
                    <p class="font-medium mb-1">No se encontraron productos</p>
                    ${productSearchTerm ? `<p class="text-sm">Intenta con otro término de búsqueda</p>` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Actualiza solo el grid de productos sin re-renderizar todo
 */
function updateProductsGrid() {
    const { productBrand, productSearchTerm } = appState.getState();

    // Filtrar productos por marca
    let filteredProducts = productBrand === 'Todas'
        ? productsData
        : productsData.filter(p => p.brand === productBrand);

    // Filtrar por término de búsqueda
    if (productSearchTerm) {
        const searchLower = productSearchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.category.toLowerCase().includes(searchLower) ||
            p.brand.toLowerCase().includes(searchLower)
        );
    }

    // Actualizar contador
    const countElement = document.getElementById('productCount');
    if (countElement) {
        countElement.textContent = `(${filteredProducts.length} productos)`;
    }

    // Actualizar grid de productos
    const gridElement = document.getElementById('productsGrid');
    if (gridElement) {
        gridElement.innerHTML = filteredProducts.map(product => renderProduct(product)).join('');
        lucide.createIcons();
    }

    // Actualizar mensaje de sin resultados
    const noResultsElement = document.getElementById('noResultsMessage');
    if (noResultsElement) {
        noResultsElement.innerHTML = filteredProducts.length === 0 ? `
            <div class="text-center py-12 text-slate-400">
                <i data-lucide="package-x" class="w-16 h-16 mx-auto mb-3"></i>
                <p class="font-medium mb-1">No se encontraron productos</p>
                ${productSearchTerm ? `<p class="text-sm">Intenta con otro término de búsqueda</p>` : ''}
            </div>
        ` : '';
        lucide.createIcons();
    }

    // Actualizar botón de limpiar búsqueda
    const clearButton = document.getElementById('clearSearchButton');
    if (clearButton) {
        clearButton.innerHTML = productSearchTerm ? `
            <button 
                onclick="clearProductSearch()"
                class="text-slate-400 hover:text-slate-600"
            >
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        ` : '';
        lucide.createIcons();
    }
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
        <div 
            class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-purple-300"
            data-product-id="${product.id}"
            onclick="showProductModal(${product.id})"
        >
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
            
            <div class="mt-3 text-center">
                <span class="text-xs text-purple-600 font-medium">
                    <i data-lucide="eye" class="w-3 h-3 inline"></i>
                    Ver detalles
                </span>
            </div>
        </div>
    `;
}

/**
 * Muestra el modal con los detalles del producto
 */
function showProductModal(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    const formattedPrice = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(product.price);

    const modalHTML = `
        <div id="productModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="closeProductModal(event)">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                <!-- Header -->
                <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-xl">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-sm font-bold bg-white bg-opacity-20 px-3 py-1 rounded-full">${product.brand}</span>
                                <span class="text-sm opacity-90">ID: ${product.id}</span>
                            </div>
                            <h2 class="text-2xl font-bold leading-tight">${product.name}</h2>
                        </div>
                        <button 
                            onclick="closeProductModal()"
                            class="ml-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                        >
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </div>
                </div>

                <!-- Content -->
                <div class="p-6">
                    <!-- Price -->
                    <div class="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-purple-700 font-medium">Precio</span>
                            <span class="text-3xl font-bold text-purple-600">${formattedPrice}</span>
                        </div>
                    </div>

                    <!-- Category -->
                    <div class="mb-6">
                        <h3 class="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <i data-lucide="tag" class="w-4 h-4 text-purple-600"></i>
                            Categoría
                        </h3>
                        <span class="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">${product.category}</span>
                    </div>

                    <!-- Description -->
                    <div class="mb-6">
                        <h3 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <i data-lucide="file-text" class="w-4 h-4 text-purple-600"></i>
                            Descripción Completa
                        </h3>
                        <p class="text-slate-600 leading-relaxed">${product.description}</p>
                    </div>

                    <!-- Product Details -->
                    <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                        <div>
                            <span class="text-xs text-slate-500 block mb-1">Marca</span>
                            <span class="text-sm font-bold text-slate-800">${product.brand}</span>
                        </div>
                        <div>
                            <span class="text-xs text-slate-500 block mb-1">ID Producto</span>
                            <span class="text-sm font-bold text-slate-800">${product.id}</span>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="p-6 bg-slate-50 rounded-b-xl border-t border-slate-200">
                    <button 
                        onclick="closeProductModal()"
                        class="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <i data-lucide="check" class="w-5 h-5"></i>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;

    // Agregar modal al body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Inicializar iconos de Lucide
    lucide.createIcons();

    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de producto
 */
function closeProductModal(event) {
    // Si se hace clic en el overlay (no en el contenido del modal)
    if (!event || event.target.id === 'productModal') {
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }
}

/**
 * Inicializa los event listeners de las marcas y búsqueda
 */
function initProductosContent() {
    const brandButtons = document.querySelectorAll('[data-brand]');

    brandButtons.forEach(button => {
        button.addEventListener('click', () => {
            const brand = button.getAttribute('data-brand');
            appState.setProductBrand(brand);
        });
    });

    // Event listener para el buscador de productos (optimizado)
    const searchInput = document.getElementById('productSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            // Actualizar el estado sin trigger de re-render completo
            const currentState = appState.getState();
            appState.state.productSearchTerm = e.target.value;

            // Actualizar solo el grid de productos
            updateProductsGrid();
        });
    }
}

/**
 * Limpia la búsqueda de productos
 */
function clearProductSearch() {
    appState.state.productSearchTerm = '';
    const searchInput = document.getElementById('productSearchInput');
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    updateProductsGrid();
}
