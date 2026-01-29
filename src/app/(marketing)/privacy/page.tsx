import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Cangoods',
  description: 'How Cangoods collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-[var(--graphite)]/60">
          Last updated: January 29, 2025
        </p>

        <div className="mt-12 space-y-10 text-[15px] leading-relaxed text-[var(--graphite)]/80 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[var(--graphite)] [&_h3]:font-medium [&_h3]:text-[var(--graphite)] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_table]:w-full [&_th]:text-left [&_th]:py-2 [&_th]:pr-4 [&_th]:font-medium [&_th]:text-[var(--graphite)] [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top">
          <div>
            <h2>1. Introduction</h2>
            <p className="mt-3">
              Cangoods (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates an
              e-commerce platform that sources premium Canadian products and delivers
              them to customers in the Philippines. This Privacy Policy explains how we
              collect, use, store, and protect your personal information when you use
              our website and services.
            </p>
            <p className="mt-3">
              By using our website or registering an account, you agree to the practices
              described in this policy.
            </p>
          </div>

          <div>
            <h2>2. Information We Collect</h2>

            <h3 className="mt-4">Personal Information</h3>
            <ul className="mt-2">
              <li>First name and last name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Contact preference (email, phone, or SMS)</li>
            </ul>

            <h3 className="mt-4">Delivery Information</h3>
            <ul className="mt-2">
              <li>Delivery addresses (street, barangay, city, province, region, postal code)</li>
              <li>Delivery method preference (pickup, delivered, COD, or COP)</li>
              <li>Courier preference (LBC or JRS)</li>
              <li>Recipient name (if different from account holder)</li>
            </ul>

            <h3 className="mt-4">Account Information</h3>
            <ul className="mt-2">
              <li>Email and password (password is hashed and never stored in plain text)</li>
              <li>Google account information if you sign in with Google OAuth</li>
            </ul>

            <h3 className="mt-4">Information We Do Not Collect</h3>
            <ul className="mt-2">
              <li>Credit card or bank account numbers — payments are handled externally via BPI bank transfer or GCash</li>
              <li>Government-issued IDs</li>
              <li>Analytics or behavioral tracking data</li>
            </ul>
          </div>

          <div>
            <h2>3. How We Use Your Information</h2>
            <ul className="mt-3">
              <li>Process and fulfill your orders</li>
              <li>Communicate order status and delivery updates via email</li>
              <li>Create and manage invoices through our accounting system</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Improve our services and customer experience</li>
            </ul>
          </div>

          <div>
            <h2>4. Third-Party Services</h2>
            <p className="mt-3">
              We use the following third-party services to operate our platform. We only
              share the minimum data necessary for each service to function.
            </p>
            <table className="mt-4">
              <thead>
                <tr className="border-b">
                  <th>Service</th>
                  <th>Purpose</th>
                  <th>Data Shared</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--graphite)]/10">
                  <td>Supabase</td>
                  <td>Database hosting &amp; authentication</td>
                  <td>All account data (encrypted at rest)</td>
                </tr>
                <tr className="border-b border-[var(--graphite)]/10">
                  <td>Vercel</td>
                  <td>Website hosting</td>
                  <td>Server logs</td>
                </tr>
                <tr className="border-b border-[var(--graphite)]/10">
                  <td>Zoho Books</td>
                  <td>Invoicing &amp; accounting</td>
                  <td>Name, email, phone</td>
                </tr>
                <tr className="border-b border-[var(--graphite)]/10">
                  <td>Resend</td>
                  <td>Transactional email delivery</td>
                  <td>Email address, name</td>
                </tr>
                <tr className="border-b border-[var(--graphite)]/10">
                  <td>Google OAuth</td>
                  <td>Optional login method</td>
                  <td>Google account info (only if you choose to sign in with Google)</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-4">
              We do not sell, rent, or trade your personal information to any third party
              for marketing or advertising purposes.
            </p>
          </div>

          <div>
            <h2>5. Cookies</h2>
            <p className="mt-3">
              We use only essential cookies required for the website to function:
            </p>
            <ul className="mt-2">
              <li>
                <strong>Authentication cookies</strong> — Secure, httpOnly cookies that
                maintain your login session. These are set automatically when you log in
                and expire when you log out or after your session ends.
              </li>
            </ul>
            <p className="mt-3">
              We do not use analytics cookies, advertising cookies, or any third-party
              tracking scripts.
            </p>
          </div>

          <div>
            <h2>6. Data Security</h2>
            <p className="mt-3">
              We take reasonable measures to protect your personal information:
            </p>
            <ul className="mt-2">
              <li>All data transmitted over HTTPS encryption</li>
              <li>Passwords are cryptographically hashed (never stored in plain text)</li>
              <li>Database access protected by row-level security policies</li>
              <li>Authentication cookies are httpOnly (inaccessible to JavaScript)</li>
              <li>Server-side credentials are never exposed to the browser</li>
            </ul>
            <p className="mt-3">
              While we strive to protect your data, no method of transmission over the
              internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </div>

          <div>
            <h2>7. Data Retention &amp; Deletion</h2>
            <p className="mt-3">
              We retain your personal information for as long as your account is active
              or as needed to provide our services. You may request deletion of your
              account and associated data by contacting us at the email address below.
            </p>
            <p className="mt-3">
              Upon receiving a deletion request, we will remove your personal data within
              30 days, except where retention is required by law or for legitimate
              business purposes (e.g., completed transaction records for accounting).
            </p>
          </div>

          <div>
            <h2>8. Your Rights</h2>
            <p className="mt-3">
              Under the Philippine Data Privacy Act of 2012 (Republic Act No. 10173),
              you have the right to:
            </p>
            <ul className="mt-2">
              <li><strong>Access</strong> — Request a copy of your personal data</li>
              <li><strong>Correction</strong> — Update or correct inaccurate information</li>
              <li><strong>Erasure</strong> — Request deletion of your personal data</li>
              <li><strong>Object</strong> — Object to processing of your data</li>
              <li><strong>Portability</strong> — Receive your data in a portable format</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us using the information below.
            </p>
          </div>

          <div>
            <h2>9. Children&apos;s Privacy</h2>
            <p className="mt-3">
              Our services are not intended for individuals under 18 years of age. We do
              not knowingly collect personal information from children. If we learn that
              we have collected data from a child under 18, we will delete that
              information promptly.
            </p>
          </div>

          <div>
            <h2>10. Changes to This Policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. We will notify you of
              significant changes by posting a notice on our website or sending an email.
              Your continued use of our services after changes are posted constitutes
              acceptance of the updated policy.
            </p>
          </div>

          <div>
            <h2>11. Contact Us</h2>
            <p className="mt-3">
              If you have questions about this Privacy Policy or wish to exercise your
              data rights, contact us at:
            </p>
            <ul className="mt-2">
              <li>Email: goodiescanada@gmail.com</li>
              <li>Phone: +1 514-692-1589</li>
              <li>WhatsApp: +1 514-690-0134</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
