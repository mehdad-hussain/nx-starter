import { createRoute } from '@hono/zod-openapi'
import * as argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { z } from 'zod'
import { AppRouteHandler } from '../../../core/core.type'
import { db } from '../../../core/db/db'
import { authUsersTable } from '../../../core/db/schema'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zResetPassword } from '../auth.schema'
import { findAuthUserByEmail } from '../auth.service'
import { decodeVerificationToken } from '../token.util'
import { BAD_REQUEST, OK } from 'stoker/http-status-codes'

const tags = ['Auth']

export const resetPasswordRoute = createRoute({
    path: '/v1/reset-password/:token',
    method: 'post',
    tags,
    request: {
        params: z.object({ token: z.string() }),
        body: jsonContentRequired(zResetPassword, 'New password'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Password reset success'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Error resetting password'),
    },
})

export const resetPasswordHandler: AppRouteHandler<
    typeof resetPasswordRoute
> = async (c) => {
    const { email, password } = c.req.valid('json')
    const token = c.req.query('token') ?? ''
    const user = await findAuthUserByEmail(email)
    const decoded = await decodeVerificationToken(token)

    if (!decoded || !user || user.id !== decoded.authUserId) {
        return c.json(
            { message: 'Invalid token', data: {}, success: false },
            BAD_REQUEST,
        )
    }

    if (user) {
        const hashedPassword = await argon2.hash(password)
        await db
            .update(authUsersTable)
            .set({ password: hashedPassword })
            .where(eq(authUsersTable.id, user.id))
        // TODO send a confirmation email to the user
        console.log(`Password reset successful for ${email}`)
        return c.json(
            { message: 'Password reset success', data: {}, success: true },
            OK,
        )
    }
    return c.json(
        { message: 'Error resetting password', data: {}, success: false },
        BAD_REQUEST,
    )
}
