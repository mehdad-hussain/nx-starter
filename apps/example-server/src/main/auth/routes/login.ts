import { createRoute } from '@hono/zod-openapi'
import * as argon2 from 'argon2'
import dayjs from 'dayjs'
import { and, eq } from 'drizzle-orm'
import {
    BAD_REQUEST,
    OK,
    PRECONDITION_REQUIRED,
} from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { z } from 'zod'
import { AppRouteHandler } from '../../../core/core.type'
import { db } from '../../../core/db/db'
import { groupsTable, usersGroupsTable } from '../../../core/db/schema'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { LEVEL_ADMIN, LEVEL_MODERATOR } from '../../user/user.schema'
import { } from '../../user/user.service'
import { zLogin } from '../auth.schema'
import { findUserByEmail, updateLastLogin } from '../auth.service'
import { createAccessToken, createRefreshToken } from '../token.util'

const tags = ['Auth']

export const loginRoute = createRoute({
    path: '/v1/login',
    method: 'post',
    tags,
    request: {
        query: z.object({ groupId: z.string().optional() }),
        body: jsonContentRequired(zLogin, 'User login details'),
    },
    responses: {
        [OK]: ApiResponse(
            z.object({
                accessToken: z.string(),
                refreshToken: z.string(),
                lastLogin: z.string(),
            }),
            'User login successful',
        ),

        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid email or password'),

        [PRECONDITION_REQUIRED]: ApiResponse(
            z.object({
                availableGroups: z.array(z.any()),
            }),
            'No group selected. Please select a group to continue',
        ),
    },
})

export const loginHandler: AppRouteHandler<typeof loginRoute> = async (c) => {
    const { email, password } = c.req.valid('json')
    // optional, group id. If provided, user is logged in to that group
    const groupId = c.req.query('groupId')
    const user = await findUserByEmail(email)

    if (!user) {
        return c.json(
            { message: 'Invalid email or password', data: {}, success: false },
            BAD_REQUEST,
        )
    }

    const now = dayjs()

    if (!(await argon2.verify(user.password, password))) {
        return c.json(
            { message: 'Invalid email or password', data: {}, success: false },
            BAD_REQUEST,
        )
    }

    await updateLastLogin(user.id)

    // if previledged user, do not check for groups and just return access token
    // TODO: fix as any
    if ([LEVEL_ADMIN, LEVEL_MODERATOR].includes(user.level as any)) {
        const accessToken = await createAccessToken(user, user.level as any)
        const refreshToken = await createRefreshToken(user)

        return c.json(
            {
                message: 'Priviledged user login successful',
                data: {
                    accessToken,
                    refreshToken,
                    lastLogin: now.toISOString(),
                },
                success: true,
            },
            OK,
        )
    }


    // if query param has group id, get the user profile belonging to that group
    let chosenGroupId = groupId || user.defaultGroupId

    if (!chosenGroupId) {
        const records = await db.query.usersGroupsTable.findMany({
            where: eq(usersGroupsTable.userId, user.id),
        })

        if (records.length === 0) {
            return c.json(
                {
                    message: 'No group found',
                    data: {
                        availableGroups: [],
                    },
                    success: false,
                },
                PRECONDITION_REQUIRED,
            )
        }

        if (records.length === 1) {
            chosenGroupId = records[0].groupId
        } else {
            return c.json(
                {
                    message: 'No group selected. Please select a group to continue',
                    data: {
                        availableGroups: records.map((u) => u.groupId), // TODO: send groups actually
                    },
                    success: false,
                },
                PRECONDITION_REQUIRED,
            )
        }
    }

    const group = await db.query.groupsTable.findFirst({
        where: eq(groupsTable.id, chosenGroupId),
    })
    const role = await db.query.usersGroupsTable.findFirst({
        where: and(eq(usersGroupsTable.userId, user.id), eq(usersGroupsTable.groupId, chosenGroupId)),
    })
    const accessToken = await createAccessToken(
        user,
        role?.role as any,
        group as any,
    ) // TODO: fix as any
    const refreshToken = await createRefreshToken(user, chosenGroupId)

    return c.json(
        {
            message: 'User login to provided group was successful',
            data: {
                accessToken,
                refreshToken,
                lastLogin: now.toISOString(),
            },
            success: true,
        },
        OK,
    )
}
