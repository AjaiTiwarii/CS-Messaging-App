import fs from "fs";
import { parse } from "csv-parse";
import prisma from "./src/prisma/client";

const CSV_PATH =
  "/home/ajai/Downloads/GeneralistRails_Project_MessageData - GeneralistRails_Project_MessageData.csv";

async function importCsv() {
  console.log("Starting CSV import...");

  const parser = fs.createReadStream(CSV_PATH).pipe(
    parse({
      columns: true,
      trim: true,
      skip_empty_lines: true,
    })
  );

  let importedMessages = 0;

  for await (const row of parser) {
    const userId = Number(row["User ID"]);
    const messageBody = row["Message Body"];
    const timestamp = new Date(row["Timestamp (UTC)"]);

    // Skip invalid rows
    if (!userId || !messageBody || isNaN(timestamp.getTime())) {
      continue;
    }

    // Ensure customer exists
    await prisma.customer.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });

    // Insert message (NO direction field)
    await prisma.message.create({
      data: {
        customerId: userId,
        content: messageBody,
        createdAt: timestamp,
        senderType: "CUSTOMER",
      },
    });

    importedMessages++;

    if (importedMessages % 500 === 0) {
      console.log(`Imported ${importedMessages} messages...`);
    }
  }

  console.log(
    `CSV import completed. Total messages imported: ${importedMessages}`
  );
}

importCsv()
  .catch((error) => {
    console.error("CSV import failed");
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
