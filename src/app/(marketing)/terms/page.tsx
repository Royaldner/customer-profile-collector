import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Cangoods',
  description: 'Terms and conditions for using Cangoods services.',
}

export default function TermsOfServicePage() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-[var(--graphite)]/60">
          Last updated: January 29, 2025
        </p>

        <div className="mt-12 space-y-10 text-[15px] leading-relaxed text-[var(--graphite)]/80 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[var(--graphite)] [&_h3]:font-medium [&_h3]:text-[var(--graphite)] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1">
          <div>
            <h2>1. Acceptance of Terms</h2>
            <p className="mt-3">
              By accessing or using the Cangoods website and services, you agree to be
              bound by these Terms of Service. If you do not agree to these terms, please
              do not use our services.
            </p>
          </div>

          <div>
            <h2>2. Service Description</h2>
            <p className="mt-3">
              Cangoods is an e-commerce platform that sources premium products from
              authorized Canadian retailers and delivers them to customers in the
              Philippines. We are the sole seller — this is not a marketplace.
            </p>
            <p className="mt-3">
              All products are inspected for authenticity and quality before shipping.
            </p>
          </div>

          <div>
            <h2>3. Account Registration</h2>
            <p className="mt-3">
              To place an order, you must register a customer profile with accurate and
              complete information. You are responsible for:
            </p>
            <ul className="mt-2">
              <li>Providing truthful, current information (name, email, phone, delivery address)</li>
              <li>Maintaining the security of your account credentials</li>
              <li>All activity that occurs under your account</li>
            </ul>
            <p className="mt-3">
              You may register using email and password or Google sign-in. We reserve the
              right to suspend accounts that contain false information.
            </p>
          </div>

          <div>
            <h2>4. Orders &amp; Payment</h2>

            <h3 className="mt-4">Payment Structure</h3>
            <p className="mt-2">
              All orders follow a 50/50 payment plan:
            </p>
            <ol className="mt-2">
              <li>
                <strong>50% upon placing your order</strong> — Your order is confirmed
                once we receive this initial payment.
              </li>
              <li>
                <strong>50% when your order is ready</strong> — The remaining balance is
                due when your order is ready for courier delivery (LBC or JRS) or
                in-location pickup.
              </li>
            </ol>

            <h3 className="mt-4">Payment Methods</h3>
            <ul className="mt-2">
              <li>BPI bank transfer</li>
              <li>GCash</li>
            </ul>
            <p className="mt-2">
              All payments are processed outside the website. We will provide payment
              instructions after you place your order.
            </p>

            <h3 className="mt-4">Pricing</h3>
            <p className="mt-2">
              All prices are listed in Philippine Pesos (PHP) and are subject to change
              without prior notice. The price at the time of order confirmation is the
              price you pay.
            </p>
          </div>

          <div>
            <h2>5. Cancellation &amp; Refund Policy</h2>

            <h3 className="mt-4">No Down Payment</h3>
            <p className="mt-2">
              No downpayment made within <strong>3 days</strong> of placing it
              will <strong>Cancel</strong> this order.
            </p>

            <h3 className="mt-4">Unpaid Balance</h3>
            <p className="mt-2">
              Unpaid balances more than <strong>30 days</strong> from when the order is ready for delivery
              or pick up at location will be <strong>cancelled.</strong> Please contact
              us immediately for unforeseen circumstances.
            </p>

            <h3 className="mt-4">Within 24 Hours</h3>
            <p className="mt-2">
              You may cancel your order within <strong>24 hours</strong> of placing it
              for a <strong>full refund</strong> of your 50% deposit. To cancel, contact
              us immediately via email, phone, or WhatsApp.
            </p>

            <h3 className="mt-4">After 24 Hours</h3>
            <p className="mt-2">
              Cancellations made after 24 hours are subject to the following:
            </p>
            <ul className="mt-2">
              <li>
                The <strong>50% deposit is non-refundable</strong>. Because we source
                products internationally upon order confirmation, we incur costs that
                cannot be recovered once the sourcing process has begun.
              </li>
              <li>
                If you have already paid the remaining 50% and wish to cancel, we will
                refund only the second payment.
              </li>
            </ul>

            <h3 className="mt-4">Damaged or Incorrect Items</h3>
            <p className="mt-2">
              If you receive a damaged or incorrect product, contact us within 7 days of
              delivery. We will arrange a replacement or full refund at our discretion,
              provided you supply photos of the issue. Refund will be sent after 3 days 
              from the receipt of the damaged or incorrect item.
            </p>
          </div>

          <div>
            <h2>6. Delivery</h2>

            <h3 className="mt-4">Estimated Delivery Time</h3>
            <p className="mt-2">
              Orders typically take <strong>10 to 12 weeks</strong> from order
              confirmation. This includes product sourcing, quality inspection, and
              international shipping from Canada to the Philippines.
            </p>
            <p className="mt-2">
              Delivery times are estimates only and may vary due to customs processing,
              courier delays, or other factors beyond our control.
            </p>

            <h3 className="mt-4">Delivery Methods</h3>
            <ul className="mt-2">
              <li><strong>Pickup</strong> — Collect your order in-store at no additional delivery cost</li>
              <li><strong>Delivered</strong> — Shipped to your address via LBC or JRS (courier fees apply)</li>
              <li><strong>Cash on Delivery (COD)</strong> — Pay the remaining balance upon delivery via LBC (courier fees apply)</li>
              <li><strong>Cash on Pickup (COP)</strong> — Pay the remaining balance when you pick up at the courier location via LBC (courier fees apply)</li>
            </ul>

            <h3 className="mt-4">Delivery Fees</h3>
            <p className="mt-2">
              In-store pickup is <strong>free</strong>. For all other delivery methods
              (Delivered, COD, and COP), additional courier fees from LBC or JRS may
              apply. These fees are determined by the courier and vary based on
              destination and package size. Courier fees are separate from the product
              price and will be communicated before your order ships.
            </p>

            <h3 className="mt-4">Delivery Responsibility</h3>
            <p className="mt-2">
              You are responsible for providing an accurate and complete delivery address.
              We are not liable for delays or failed deliveries caused by incorrect
              address information. Reshipment costs due to address errors will be borne
              by the customer.
            </p>
          </div>

          <div>
            <h2>7. Product Authenticity</h2>
            <p className="mt-3">
              All products sold on Cangoods are sourced directly from authorized Canadian
              retailers. We guarantee the authenticity of every item. Each product is
              inspected for quality before shipping.
            </p>
          </div>

          <div>
            <h2>8. User Responsibilities</h2>
            <p className="mt-3">
              By using our services, you agree to:
            </p>
            <ul className="mt-2">
              <li>Provide accurate personal and delivery information</li>
              <li>Respond promptly to delivery confirmation emails and payment requests</li>
              <li>Not misuse, abuse, or attempt to exploit our platform</li>
              <li>Not create multiple accounts for fraudulent purposes</li>
            </ul>
          </div>

          <div>
            <h2>9. Limitation of Liability</h2>
            <p className="mt-3">
              To the maximum extent permitted by law, Cangoods shall not be liable for:
            </p>
            <ul className="mt-2">
              <li>Delays caused by international shipping, customs, or courier services</li>
              <li>Loss or damage during transit by third-party couriers (LBC, JRS)</li>
              <li>Service interruptions due to maintenance, technical issues, or events beyond our control</li>
              <li>Indirect, incidental, or consequential damages arising from the use of our services</li>
            </ul>
            <p className="mt-3">
              Our total liability for any claim shall not exceed the amount you paid for
              the specific order in question.
            </p>
          </div>

          <div>
            <h2>10. Intellectual Property</h2>
            <p className="mt-3">
              All content on the Cangoods website — including text, images, logos, and
              design — is the property of Cangoods or its licensors and is protected by
              applicable intellectual property laws. You may not reproduce, distribute,
              or use any content without our written permission.
            </p>
          </div>

          <div>
            <h2>11. Governing Law</h2>
            <p className="mt-3">
              These Terms of Service are governed by and construed in accordance with the
              laws of the Republic of the Philippines. Any disputes arising from these
              terms shall be subject to the exclusive jurisdiction of the courts of the
              Philippines.
            </p>
          </div>

          <div>
            <h2>12. Changes to These Terms</h2>
            <p className="mt-3">
              We reserve the right to modify these Terms of Service at any time. Changes
              will be posted on this page with an updated date. Your continued use of our
              services after changes are posted constitutes acceptance of the revised
              terms.
            </p>
            <p className="mt-3">
              For significant changes, we will notify you via email.
            </p>
          </div>

          <div>
            <h2>13. Contact Us</h2>
            <p className="mt-3">
              If you have questions about these Terms of Service, contact us at:
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
