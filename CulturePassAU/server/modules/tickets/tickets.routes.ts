import type { Express, Request, Response } from "express";
import * as ticketsService from "./tickets.service";
import { AppError, ErrorCodes, wrapHandler } from "../../errors";

function p(val: string | string[]): string { return Array.isArray(val) ? val[0] : val; }

export function registerTicketsRoutes(app: Express) {
  app.get("/api/tickets/:userId", async (req: Request, res: Response) => {
    const tickets = await ticketsService.getTickets(p(req.params.userId));
    res.json(tickets);
  });

  app.get("/api/tickets/:userId/count", async (req: Request, res: Response) => {
    const count = await ticketsService.getTicketCount(p(req.params.userId));
    res.json({ count });
  });

  app.get("/api/ticket/:id", async (req: Request, res: Response) => {
    const ticket = await ticketsService.getTicket(p(req.params.id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  });

  app.post("/api/tickets", async (req: Request, res: Response) => {
    try {
      const ticket = await ticketsService.createTicket(req.body);
      res.status(201).json(ticket);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/tickets/:id/cancel", async (req: Request, res: Response) => {
    const ticket = await ticketsService.cancelTicket(p(req.params.id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  });

  app.post("/api/tickets/scan", async (req: Request, res: Response) => {
    try {
      const { ticketCode, scannedBy } = req.body;
      if (!ticketCode) return res.status(400).json({ error: "Ticket code is required" });

      const ticket = await ticketsService.getTicketByCode(ticketCode);
      if (!ticket) return res.status(404).json({ error: "Invalid ticket code", valid: false });

      if (ticket.status === "used") {
        return res.status(400).json({
          error: "Ticket already scanned",
          valid: false,
          ticket,
          scannedAt: ticket.scannedAt,
        });
      }

      if (ticket.status === "cancelled") {
        return res.status(400).json({ error: "Ticket has been cancelled", valid: false, ticket });
      }

      if (ticket.status === "expired") {
        return res.status(400).json({ error: "Ticket has expired", valid: false, ticket });
      }

      const updated = await ticketsService.scanTicket(ticket.id, scannedBy || "staff");
      res.json({ valid: true, message: "Ticket scanned successfully", ticket: updated });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/tickets-all", async (_req: Request, res: Response) => {
    const allTickets = await ticketsService.getAllTickets();
    res.json(allTickets);
  });

  app.get("/api/tickets/event/:eventId", async (req: Request, res: Response) => {
    const eventTickets = await ticketsService.getTicketsByEvent(p(req.params.eventId));
    res.json(eventTickets);
  });

  app.post("/api/tickets/backfill-qr", async (_req: Request, res: Response) => {
    const count = await ticketsService.backfillQRCodes();
    res.json({ message: `Backfilled ${count} tickets with QR codes` });
  });

  app.post("/api/tickets/:id/scan", wrapHandler(async (req: Request, res: Response) => {
    const ticketId = p(req.params.id);
    const { scannedBy } = req.body;

    const ticket = await ticketsService.getTicket(ticketId);
    if (!ticket) {
      throw new AppError(ErrorCodes.TICKET_NOT_FOUND, 404, 'Ticket not found.');
    }

    if (ticket.status === 'used') {
      throw new AppError(ErrorCodes.TICKET_ALREADY_SCANNED, 400, 'This ticket has already been scanned.');
    }

    if (ticket.status === 'cancelled') {
      throw new AppError(ErrorCodes.TICKET_ALREADY_CANCELLED, 400, 'This ticket has been cancelled and is no longer valid.');
    }

    if (ticket.paymentStatus !== 'paid' && ticket.totalPrice && ticket.totalPrice > 0) {
      throw new AppError(ErrorCodes.PAYMENT_PENDING, 400, 'This ticket has not been paid for yet.');
    }

    if (ticket.eventDate) {
      const [year, month, day] = ticket.eventDate.split('-').map(Number);
      if (year && month && day) {
        const eventDate = new Date(year, month - 1, day);
        const dayAfter = new Date(eventDate);
        dayAfter.setDate(dayAfter.getDate() + 1);
        if (new Date() > dayAfter) {
          throw new AppError(ErrorCodes.TICKET_EXPIRED, 400, 'This ticket has expired. The event date has passed.');
        }
      }
    }

    const updated = await ticketsService.updateTicketPayment(ticketId, {
      status: 'used',
      scannedAt: new Date(),
      scannedBy: scannedBy || 'staff',
    } as any);

    return res.json({
      success: true,
      data: {
        message: 'Ticket scanned successfully',
        ticket: updated,
      },
    });
  }));

  app.get("/api/tickets/:id/wallet/apple", async (req: Request, res: Response) => {
    const ticket = await ticketsService.getTicket(p(req.params.id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.culturepass.ticket",
      serialNumber: ticket.id,
      teamIdentifier: "CULTUREPASS",
      organizationName: "CulturePass",
      description: ticket.eventTitle,
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: ticket.imageColor || "rgb(0, 122, 255)",
      eventTicket: {
        primaryFields: [{ key: "event", label: "EVENT", value: ticket.eventTitle }],
        secondaryFields: [
          { key: "date", label: "DATE", value: ticket.eventDate || "" },
          { key: "time", label: "TIME", value: ticket.eventTime || "" },
        ],
        auxiliaryFields: [
          { key: "venue", label: "VENUE", value: ticket.eventVenue || "" },
          { key: "tier", label: "TIER", value: ticket.tierName || "General" },
        ],
        backFields: [
          { key: "code", label: "TICKET CODE", value: ticket.ticketCode || "" },
          { key: "quantity", label: "QUANTITY", value: String(ticket.quantity || 1) },
        ],
      },
      barcode: {
        message: ticket.ticketCode || ticket.id,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1",
      },
    };
    
    res.json({ pass: passData, message: "Apple Wallet pass generated. In production, this would be a downloadable .pkpass file." });
  });

  app.get("/api/tickets/:id/wallet/google", async (req: Request, res: Response) => {
    const ticket = await ticketsService.getTicket(p(req.params.id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    
    const passData = {
      id: `culturepass-${ticket.id}`,
      classId: "culturepass.event_ticket",
      eventName: { defaultValue: { language: "en", value: ticket.eventTitle } },
      dateTime: {
        start: ticket.eventDate ? `${ticket.eventDate}T${ticket.eventTime || "00:00"}` : undefined,
      },
      venue: {
        name: { defaultValue: { language: "en", value: ticket.eventVenue || "" } },
      },
      ticketHolderName: "CulturePass Member",
      ticketNumber: ticket.ticketCode || ticket.id,
      seatInfo: {
        section: { defaultValue: { language: "en", value: ticket.tierName || "General" } },
      },
      barcode: {
        type: "QR_CODE",
        value: ticket.ticketCode || ticket.id,
      },
      hexBackgroundColor: ticket.imageColor || "#007AFF",
    };
    
    res.json({ pass: passData, message: "Google Wallet pass generated. In production, this would redirect to Google Wallet save URL." });
  });
}
