// Tipos mínimos do runtime Cloudflare usados pelo servidor.
interface D1Result<T = any> { results: T[]; meta: { changes: number } }
interface D1PreparedStatement { bind(...v: unknown[]): D1PreparedStatement; first<T = any>(): Promise<T | null>; all<T = any>(): Promise<D1Result<T>>; run(): Promise<D1Result> }
interface D1Database { prepare(q: string): D1PreparedStatement; batch(s: D1PreparedStatement[]): Promise<D1Result[]> }
interface DurableObjectStub { fetch(r: Request): Promise<Response> }
interface DurableObjectNamespace { idFromName(n: string): unknown; get(id: unknown, o?: { locationHint: string }): DurableObjectStub }
interface CfWebSocket { accept(): void; send(d: string): void; close(c?: number, r?: string): void; addEventListener(t: 'message' | 'close' | 'error', f: (e: any) => void): void }
declare class WebSocketPair { 0: CfWebSocket; 1: CfWebSocket }
interface Env { DB: D1Database; MAP_ROOM: DurableObjectNamespace }
