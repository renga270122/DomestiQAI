import { useState } from "react";

const curatedLinks = [
  {
    title: "10 Cleaning Tips for a Healthier Home",
    url: "https://www.goodhousekeeping.com/home/cleaning/tips/",
    type: "tip",
  },
  {
    title: "Eco-Friendly Cleaning Products",
    url: "https://www.nytimes.com/wirecutter/reviews/best-green-cleaning-products/",
    type: "product",
  },
  {
    title: "How to Clean Every Room in Your House",
    url: "https://www.realsimple.com/home-organizing/cleaning/cleaning-every-room",
    type: "tip",
  },
  {
    title: "Best Microfiber Cloths for Cleaning",
    url: "https://www.nytimes.com/wirecutter/reviews/the-best-microfiber-cloths/",
    type: "product",
  },
  {
    title: "Homemade Cleaning Solutions That Work",
    url: "https://www.apartmenttherapy.com/homemade-cleaning-solutions-367266",
    type: "tip",
  },
];

export default function CleaningResources() {
  const [links] = useState(curatedLinks);

  return (
    <section style={{ marginTop: 24 }}>
      <h2>Cleaning Resources & Product Picks</h2>
      <ul>
        {links.map((link, idx) => (
          <li key={idx} style={{ marginBottom: 8 }}>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.title}
            </a>
            {link.type === "product" && <span style={{ marginLeft: 8, color: "#0f7cae" }}>[Product]</span>}
            {link.type === "tip" && <span style={{ marginLeft: 8, color: "#17a5a4" }}>[Tip]</span>}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: "0.95em", color: "#466581" }}>Know a great tip or product? Suggest it to us for future updates!</p>
    </section>
  );
}
