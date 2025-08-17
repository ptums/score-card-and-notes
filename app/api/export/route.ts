/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { userDB } from "@/lib/user-db";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const includePasswords = searchParams.get("includePasswords") === "true";

    // Get all data
    const users = await userDB.getAllUsers();
    const games = await db.games.toArray();
    const courses = await db.courses.toArray();

    // Prepare export data
    const exportData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        isActive: user.isActive,
        ...(includePasswords && { passwordHash: user.passwordHash }),
      })),
      games: games,
      courses: courses,
      metadata: {
        totalUsers: users.length,
        totalGames: games.length,
        totalCourses: courses.length,
        exportFormat: format,
      },
    };

    if (format === "csv") {
      // Convert to CSV format
      const csvData = convertToCSV(exportData);
      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="golf-buddy-export-${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    }

    // Default JSON format
    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Error in export API:", error);
    return NextResponse.json(
      {
        error: "Export failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function convertToCSV(data: any): string {
  const { users, games, courses, metadata } = data;

  let csv = "Golf Buddy Data Export\n";
  csv += `Export Date: ${data.exportDate}\n`;
  csv += `Total Users: ${metadata.totalUsers}\n`;
  csv += `Total Games: ${metadata.totalGames}\n`;
  csv += `Total Courses: ${metadata.totalCourses}\n\n`;

  // Users section
  if (users.length > 0) {
    csv += "USERS\n";
    csv += "ID,Email,Name,Created,Last Login,Status\n";
    users.forEach((user: any) => {
      csv += `${user.id},${user.email},${user.name},${user.createdAt},${
        user.lastLoginAt || ""
      },${user.isActive ? "Active" : "Inactive"}\n`;
    });
    csv += "\n";
  }

  // Courses section
  if (courses.length > 0) {
    csv += "COURSES\n";
    csv += "ID,Name,Rounds\n";
    courses.forEach((course: any) => {
      csv += `${course.id || ""},${course.name || ""},${course.rounds || ""}\n`;
    });
    csv += "\n";
  }

  // Games section
  if (games.length > 0) {
    csv += "GAMES\n";
    csv += "ID,Course ID,Course Name,Date,Final Score,Final Note\n";
    games.forEach((game: any) => {
      const course = courses.find((c: any) => c.id === game.courseId);
      const courseName = course ? course.name : "Unknown Course";
      csv += `${game.id || ""},${game.courseId || ""},${courseName},${
        game.date || ""
      },${game.finalScore || ""},${game.finalNote || ""}\n`;
    });
  }

  return csv;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "import":
        if (!data || !data.users || !data.games) {
          return NextResponse.json(
            {
              error: "Invalid import data format",
            },
            { status: 400 }
          );
        }

        // Import users
        let importedUsers = 0;
        for (const user of data.users) {
          try {
            await userDB.importUsers([user]);
            importedUsers++;
          } catch (error) {
            console.warn(`Failed to import user ${user.email}:`, error);
          }
        }

        // Import games
        let importedGames = 0;
        for (const game of data.games) {
          try {
            await db.games.add(game);
            importedGames++;
          } catch (error) {
            console.warn(`Failed to import game ${game.id}:`, error);
          }
        }

        return NextResponse.json({
          success: true,
          importedUsers,
          importedGames,
          message: `Successfully imported ${importedUsers} users and ${importedGames} games`,
        });

      default:
        return NextResponse.json(
          {
            error: "Invalid action parameter",
            availableActions: ["import"],
            usage: {
              import: { action: "import", data: { users: [], games: [] } },
            },
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in export API POST:", error);
    return NextResponse.json(
      {
        error: "Import failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
