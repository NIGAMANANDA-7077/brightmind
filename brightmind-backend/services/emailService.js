const nodemailer = require('nodemailer');

/**
 * Send a welcome email to a newly created user.
 *
 * @param {object} params
 * @param {string} params.name       – Full name of the user
 * @param {string} params.email      – Recipient email address
 * @param {string} params.password   – Plain-text password (before hashing)
 * @param {string} params.role       – 'Student' | 'Teacher'
 * @param {string[]} params.courses  – Array of course names
 * @param {string|null} params.batch – Batch name (students only), or null
 */
const sendWelcomeEmail = async ({ name, email, password, role, courses = [], batch = null, studentId = null }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('[Email] EMAIL_USER / EMAIL_PASS not configured — skipping welcome email.');
        return { skipped: true };
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const firstName = name.trim().split(' ')[0];
    const loginUrl = process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/login`
        : 'http://localhost:5173/login';

    const coursesText = courses.length > 0 ? courses.join(', ') : 'None assigned yet';

    const courseRow = role === 'Student'
        ? `
          <tr>
            ${studentId ? `
            <td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;"><strong>Student ID</strong></td>
            <td style="padding:8px 0;">
              <code style="background:#ede9fe;color:#6d28d9;padding:4px 10px;border-radius:6px;font-weight:bold;font-size:15px;">${studentId}</code>
            </td>
            ` : ''}
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;"><strong>Courses</strong></td>
            <td style="padding:8px 0;color:#111827;">${coursesText}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;"><strong>Batch</strong></td>
            <td style="padding:8px 0;color:#111827;">${batch || 'Not assigned yet'}</td>
          </tr>`
        : `
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;"><strong>Teaching</strong></td>
            <td style="padding:8px 0;color:#111827;">${coursesText}</td>
          </tr>`;

    const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px;">
      <div style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);padding:28px;border-radius:8px 8px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">Welcome to BrightMind LMS!</h1>
      </div>
      <div style="padding:28px;background:#ffffff;">
        <p style="color:#374151;font-size:16px;">Hello <strong>${firstName}</strong>,</p>
        <p style="color:#6b7280;margin-top:0;">Your LMS account has been successfully created. Here are your login credentials:</p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:20px;border-radius:10px;margin:20px 0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;"><strong>Role</strong></td>
              <td style="padding:8px 0;color:#111827;">${role}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;"><strong>Login Email</strong></td>
              <td style="padding:8px 0;color:#111827;">${email}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;"><strong>Password</strong></td>
              <td style="padding:8px 0;">
                <code style="background:#ede9fe;color:#6d28d9;padding:4px 10px;border-radius:6px;font-weight:bold;font-size:15px;">${password}</code>
              </td>
            </tr>
            ${courseRow}
          </table>
        </div>
        <div style="text-align:center;margin:28px 0;">
          <a href="${loginUrl}"
             style="display:inline-block;background:#8b5cf6;color:white;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
            Login to BrightMind
          </a>
        </div>
        <p style="color:#9ca3af;font-size:13px;text-align:center;">
          For security, please change your password after your first login.
        </p>
      </div>
    </div>`;

    const textBody =
        `Hello ${firstName},\n\n` +
        `Your LMS account has been created.\n\n` +
        `Role: ${role}\n` +
        (role === 'Student' && studentId ? `Student ID: ${studentId}\n` : '') +
        `Login Email: ${email}\n` +
        `Password: ${password}\n` +
        (role === 'Student'
            ? `Courses: ${coursesText}\nBatch: ${batch || 'Not assigned yet'}\n`
            : `Teaching Courses: ${coursesText}\n`) +
        `\nLogin here: ${loginUrl}\n\n` +
        `Please change your password after your first login.`;

    await transporter.sendMail({
        from: `"BrightMind LMS" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to LMS Platform – Your Account Details',
        text: textBody,
        html: htmlBody,
    });

    return { sent: true };
};

module.exports = { sendWelcomeEmail };
