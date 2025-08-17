import { NextRequest, NextResponse } from "next/server";
import { userDB } from "@/lib/user-db";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const email = searchParams.get("email");
    const id = searchParams.get("id");

    switch (action) {
      case "count":
        const count = await userDB.getUserCount();
        return NextResponse.json({ count });

      case "all":
        const allUsers = await userDB.getAllUsers();
        // Remove sensitive data for security
        const safeUsers = allUsers.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          isActive: user.isActive,
        }));
        return NextResponse.json({ users: safeUsers });

      case "by-email":
        if (!email) {
          return NextResponse.json(
            { error: "Email parameter required" },
            { status: 400 }
          );
        }
        const userByEmail = await userDB.getUserByEmail(email);
        if (!userByEmail) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }
        // Remove sensitive data
        const safeUserByEmail = {
          id: userByEmail.id,
          email: userByEmail.email,
          name: userByEmail.name,
          createdAt: userByEmail.createdAt,
          lastLoginAt: userByEmail.lastLoginAt,
          isActive: userByEmail.isActive,
        };
        return NextResponse.json({ user: safeUserByEmail });

      case "by-id":
        if (!id) {
          return NextResponse.json(
            { error: "ID parameter required" },
            { status: 400 }
          );
        }
        const userById = await userDB.getUserById(id);
        if (!userById) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }
        // Remove sensitive data
        const safeUserById = {
          id: userById.id,
          email: userById.email,
          name: userById.name,
          createdAt: userById.createdAt,
          lastLoginAt: userById.lastLoginAt,
          isActive: userById.isActive,
        };
        return NextResponse.json({ user: safeUserById });

      default:
        return NextResponse.json(
          {
            error: "Invalid action parameter",
            availableActions: ["count", "all", "by-email", "by-id"],
            usage: {
              count: "/api/users?action=count",
              all: "/api/users?action=all",
              byEmail: "/api/users?action=by-email&email=user@example.com",
              byId: "/api/users?action=by-id&id=user-id",
            },
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in users API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "create":
        const { email, password, name } = data;
        if (!email || !password || !name) {
          return NextResponse.json(
            {
              error: "Missing required fields: email, password, name",
            },
            { status: 400 }
          );
        }

        const newUser = await userDB.createUser({ email, password, name });
        // Return user without sensitive data
        const safeNewUser = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          createdAt: newUser.createdAt,
          isActive: newUser.isActive,
        };
        return NextResponse.json({ user: safeNewUser }, { status: 201 });

      case "authenticate":
        const { email: authEmail, password: authPassword } = data;
        if (!authEmail || !authPassword) {
          return NextResponse.json(
            {
              error: "Missing required fields: email, password",
            },
            { status: 400 }
          );
        }

        const authenticatedUser = await userDB.authenticateUser({
          email: authEmail,
          password: authPassword,
        });
        // Return user without sensitive data
        const safeAuthUser = {
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          name: authenticatedUser.name,
          createdAt: authenticatedUser.createdAt,
          lastLoginAt: authenticatedUser.lastLoginAt,
          isActive: authenticatedUser.isActive,
        };
        return NextResponse.json({ user: safeAuthUser });

      default:
        return NextResponse.json(
          {
            error: "Invalid action parameter",
            availableActions: ["create", "authenticate"],
            usage: {
              create: {
                action: "create",
                email: "user@example.com",
                password: "password",
                name: "User Name",
              },
              authenticate: {
                action: "authenticate",
                email: "user@example.com",
                password: "password",
              },
            },
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in users API POST:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
