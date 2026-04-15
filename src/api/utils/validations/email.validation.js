export const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(email)) {
        throw new Error("E-mail informado inválido.")
    }
}
