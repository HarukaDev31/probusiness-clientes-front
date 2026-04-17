export interface AgenciesOptions{
    label: string
    value: string
}
/** Fila de proveedor embarcado (estado LOADED) dentro de cada opción de data */
export interface MercanciaEmbarcada {
    proveedor: string
    bultos: number
    producto: string
}

export interface ClientesOptions{
    label: string
    value: string
    mercancias?: MercanciaEmbarcada[]
}

export interface ClientesResponse{
    data: ClientesOptions[]
    carga: string
    success: boolean
}
export interface AgenciesResponse{
    data: AgenciesOptions[]
    success: boolean
}