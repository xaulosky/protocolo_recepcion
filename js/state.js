/**
 * State Management Module
 * Gestiona el estado global de la aplicación
 */

class AppState {
    constructor() {
        this.state = {
            activeTab: 'base',
            scriptCategory: 'Gestion',
            searchTerm: '',
            productBrand: 'Todas',
            productSearchTerm: '',
            profesionalSearchTerm: '',
            profesionalViewMode: 'cards', // 'list', 'grid', 'cards'
            boxSearchTerm: '',
            boxCategory: 'todas',
            boxViewMode: 'cards' // 'cards', 'list'
        };
        this.listeners = [];
    }

    /**
     * Obtiene el estado actual
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Actualiza el estado y notifica a los listeners
     */
    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.notifyListeners();
    }

    /**
     * Suscribe un listener para cambios de estado
     */
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notifica a todos los listeners
     */
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }

    /**
     * Métodos de conveniencia para actualizar estado específico
     */
    setActiveTab(tab) {
        this.setState({ activeTab: tab });
    }

    setScriptCategory(category) {
        this.setState({ scriptCategory: category });
    }

    setSearchTerm(term) {
        this.setState({ searchTerm: term });
    }

    clearSearch() {
        this.setState({ searchTerm: '' });
    }

    setProductBrand(brand) {
        this.setState({ productBrand: brand });
    }

    setProductSearchTerm(term) {
        this.setState({ productSearchTerm: term });
    }

    setProfesionalSearchTerm(term) {
        this.setState({ profesionalSearchTerm: term });
    }

    setProfesionalViewMode(mode) {
        this.setState({ profesionalViewMode: mode });
    }
}

// Instancia única (singleton) - variable global
const appState = new AppState();
