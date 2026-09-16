export function HowItWorks() {
  return (
    <section className="how-it-works" aria-label="How a payment works">
      <article>
        <p className="label">1</p>
        <h2>Ask</h2>
        <p>Vendor, amount, and reason stay private.</p>
      </article>
      <article>
        <p className="label">2</p>
        <h2>Prove</h2>
        <p>Your wallet approves. Midnight checks the private budget.</p>
      </article>
      <article>
        <p className="label">3</p>
        <h2>See the result</h2>
        <p>Allowed requests show as authorized. Funds move only if you settle.</p>
      </article>
    </section>
  );
}
