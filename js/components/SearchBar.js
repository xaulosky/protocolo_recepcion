/**
 * SearchBar Component
 * Barra de búsqueda con funcionalidad de limpiar
 */

function SearchBar() {
    const { searchTerm } = appState.getState();

    return `
        <div class="mt-4 relative">
            <input 
                type="text" 
                id="searchInput" 
                placeholder="Buscar 'InBody', 'Tatuaje', 'Cancelación'..."
                class="w-full pl-10 pr-10 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                value="${searchTerm}"
            />
            <i data-lucide="search" class="absolute left-3 top-3.5 text-slate-400 w-5 h-5"></i>
            <button 
                id="clearSearchBtn" 
                class="absolute right-3 top-3.5 text-slate-400 hover:text-white ${searchTerm ? '' : 'hidden'}"
            >
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
    `;
}

/**
 * Inicializa los event listeners de la barra de búsqueda
 */
function initSearchBar() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            appState.setSearchTerm(e.target.value);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            appState.clearSearch();
            if (searchInput) searchInput.value = '';
        });
    }
}
