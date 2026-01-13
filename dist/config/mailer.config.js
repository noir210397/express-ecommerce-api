"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestEmail = sendTestEmail;
exports.sendAdminOrderNotification = sendAdminOrderNotification;
exports.sendOrderSuccessEmail = sendOrderSuccessEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const adminEmail = "rainwatergalerie@gmail.com";
const transporter = nodemailer_1.default.createTransport(process.env.NODE_ENV === "development" ? {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "rainwatergalerie@gmail.com",
        pass: process.env.GMAIL_PASSWORD
    }, tls: {
        rejectUnauthorized: false, // <– this line allows self-signed certs
    },
} : {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "rainwatergalerie@gmail.com",
        pass: process.env.GMAIL_PASSWORD
    }
});
async function sendOrderSuccessEmail(order) {
    try {
        const { trackingNumber, emailAddress, items, name } = order;
        let total = 0;
        items.forEach(item => {
            total += Number((item.price * item.quantity).toFixed(2));
        });
        const mailOptions = {
            from: adminEmail, // Sender address
            to: emailAddress, // Customer's email address
            subject: "Order Confirmation", // Email subject
            html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h1 style="color: #333; text-align: center;">TECHIECOMMERCE</h1>
    <h2 style="color: #333; text-align: center;">Thank you for your order!</h2>
      <p style="color: #555; text-align: center;">Your order has been successfully processed.</p>
      <div style="margin-top: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Order Details</h2>
        <p style="color: #555;"><strong>Tracking ID:</strong> ${trackingNumber}</p>
        <p style="color: #555;"> You can expect delivery in 3-5 business days, you will notified when your order is out for delivery.</p>
      </div>
      <div style="margin-top: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Items</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${items
                .map((item) => `
            <tr style="background-color: #f9f9f9; border-radius: 8px; margin-bottom: 15px;">
              <td style="padding: 10px;">
                <img src="${item.images[0]}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" />
              </td>
              <td style="padding: 10px;">
                <p style="color: #333; font-weight: bold; margin: 0;">${item.name}</p>
                <p style="color: #555; margin: 0;">Unit Price: £${item.price.toFixed(2)}</p>
                <p style="color: #555; margin: 0;">Quantity: ${item.quantity}</p>
                <p style="color: #555; margin: 0;">Subtotal: £${(item.price * item.quantity).toFixed(2)}</p>
              </td>
            </tr>
          `)
                .join("")}
        </table>
      </div>
        <div style="font-size:30px; font-weight:700; color:#555">Total:${total}</div>
      <div style="margin-top: 20px; text-align: center;">
        <p style="color: #555;">If you have any questions, please contact us at <a href="mailto:${adminEmail}" style="color: #007bff; text-decoration: none;">${adminEmail}</a>.</p>
      </div>
    </div>
  `, // Email body (HTML)
            text: `
            Hello ${name}, 

            your order was successfully processed your Order tracking Id is ${trackingNumber}
             You can expect delivery in 3-5 business days.
            Order Total: £${total}

            If you have any questions, please contact us at ${adminEmail}.

            Regards, 
            VINZINEE
            `
        };
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${emailAddress}`);
    }
    catch (error) {
        console.error("Failed to send email:", error);
    }
}
async function sendAdminOrderNotification(order) {
    try {
        const { shippingAddress, trackingNumber, items, emailAddress } = order;
        const mailOptions = {
            from: adminEmail, // Sender address',
            to: adminEmail, // Admin email
            subject: "New Order Notification",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="text-align: center; font-size:30px; font-weight: 700; font- margin-bottom: 30px;">
                       TECHIECOMMERCE New Order
                    </h1>
                    <h2 style="color: #333; text-align: center;">New Order Received</h2>
                    <div style="margin-top: 20px;">
                        <h2 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Order Summary</h2>
                        <p><strong>Order ID:</strong> ${trackingNumber}</p>
                        <p><strong>Customer Email:</strong> ${emailAddress}</p>
                        <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
                    </div>

                    <div style="margin-top: 20px;">
                        <h2 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Items Ordered</h2>
                        <table style="width: 100%;">
                            ${items.map(item => `
                                <tr style="margin-bottom: 15px;">
                                    <td style="padding: 10px;">
                                        <img src="${item.images[0]}" 
                                             alt="${item.name}" 
                                             style="width: 80px; height: 80px; object-fit: cover;">
                                    </td>
                                    <td style="padding: 10px;">
                                        <p style="margin: 0;">${item.name}</p>
                                        <p style="margin: 0;">Quantity: ${item.quantity}</p>
                                        <p style="margin: 0;">Price: £${item.price.toFixed(2)}</p>
                                    </td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                </div>
            `,
            text: `new order placed with trackingId:${trackingNumber} customer email: ${emailAddress} shipping address: ${shippingAddress}`
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Admin notification sent successfully");
    }
    catch (error) {
        console.error("Failed to send admin notification:", error);
    }
}
async function sendTestEmail(subject, text) {
    const mailOptions = {
        from: adminEmail, // Sender address
        to: "noir210397@gmail.com", // Recipient address
        subject, // Email subject   
        body: `<h1>${text}</h1>`, // Email body (plain text)
    };
    await transporter.sendMail(mailOptions);
    console.log(`Test email sent successfully to ${adminEmail}`);
}
;
