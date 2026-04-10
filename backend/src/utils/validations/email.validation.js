export const validarEmail = (dados) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(dados.email)) {
        throw new Error("E-mail informado inválido.")
    }
}