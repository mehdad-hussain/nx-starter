import { createRoute } from '@hono/zod-openapi'
import * as argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import { BAD_REQUEST, OK, UNAUTHORIZED } from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { db } from '../../../core/db/db'
import { usersTable } from '../../../core/db/schema'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zChangePassword } from '../auth.schema'
import { buildpasswordChangeSuccessfulEmailTemplate } from '../../email/templates/password-change-successful'
import { sendEmailUsingResend } from '../../../core/email/email.service'
import { findUserById } from '../../user/user.service'

const tags = ['Auth']

export const changePasswordRoute = createRoute({
    path: '/v1/change-password',
    method: 'post',
    tags,
    request: {
        body: jsonContentRequired(zChangePassword, 'Change password details'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Password changed successfully'),
        [UNAUTHORIZED]: ApiResponse(zEmpty, 'Unauthorized'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Current password does not match'),
    },
})

export const changePasswordHandler: AppRouteHandler<
    typeof changePasswordRoute
> = async (c) => {
    const { userId } = c.req.valid('json')
    if (!userId) {
        return c.json(
            { message: 'Unauthorized', success: false, data: {} },
            UNAUTHORIZED,
        )
    }

    const { currentPassword, password } = c.req.valid('json')

    const user = await findUserById(userId)

    if (!user) {
        return c.json(
            { message: 'User not found', success: false, data: {} },
            UNAUTHORIZED,
        )
    }

    // Verify the current password
    const currentPasswordMatches = await argon2.verify(
        user.password,
        currentPassword,
    )
    if (!currentPasswordMatches) {
        return c.json(
            {
                message: 'Current password does not match',
                success: false,
                data: {},
            },
            BAD_REQUEST,
        )
    }

    // Hash the new password and update the database
    const hashedPassword = await argon2.hash(password)
    await db
        .update(usersTable)
        .set({ password: hashedPassword })
        .where(eq(usersTable.id, userId))

    const passwordChangeTemplate = buildpasswordChangeSuccessfulEmailTemplate({
        email: user.email,
    })
    const { data, error } = await sendEmailUsingResend(
        [user.email],
        'Password change',
        passwordChangeTemplate,
    )
    // TODO: log sending email error

    return c.json(
        {
            message: 'Password changed successfully',
            data: {},
            success: true,
        },
        OK,
    )
}
