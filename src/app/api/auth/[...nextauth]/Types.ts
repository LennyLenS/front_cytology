export interface Token {
    name: string
    email: string
    sub: string
    accessToken: string
    accessTokenExpiry: Date | string
    refreshToken: string
    id?: string
    iat: number
    exp: number
    jti: string
}

export interface User {
    name: string
    email: string
    image: undefined
    data: {
        accessToken: string
        accessTokenExpiry: Date | string
        refreshToken: string
        id?: string
    }
}
