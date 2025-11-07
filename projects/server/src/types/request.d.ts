import { User } from '../entities/user';
import { Request } from 'express';

interface ExtendRequest extends Request {
    /** 中间件捕获的 IP 地址 */
    ip: string | null;

    /** 当前登录的用户信息 */
    user?: User;

    cookies: { [key: string]: string | undefined };

    /** 当前用户的凭证 */
    token?: string;
    /** 标记 token 是否已过期 */
    tokenExpired?: boolean;
    /** 标记 token 是否被禁用 */
    tokenDisable?: boolean;
    /** 标记 token 是否在其他设备登录 */
    tokenLoginOther?: boolean;
}

// 扩展全局 Express Request 类型
declare global {
    namespace Express {
        interface Request {
            /** 中间件捕获的 IP 地址 */
            ip: string | null;

            /** 当前登录的用户信息 */
            user?: User;

            cookies: { [key: string]: string | undefined };

            /** 当前用户的凭证 */
            token?: string;
            /** 标记 token 是否已过期 */
            tokenExpired?: boolean;
            /** 标记 token 是否被禁用 */
            tokenDisable?: boolean;
            /** 标记 token 是否在其他设备登录 */
            tokenLoginOther?: boolean;
        }
    }
}
