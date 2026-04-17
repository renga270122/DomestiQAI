import { useState, useEffect } from "react";

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
    buyLinks: [
      { label: "Amazon", url: "https://www.amazon.com/s?k=eco+cleaning+products" },
      { label: "Walmart", url: "https://www.walmart.com/search/?query=eco%20cleaning%20products" }
    ]
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
    buyLinks: [
      { label: "Amazon", url: "https://www.amazon.com/s?k=microfiber+cloths" },
      { label: "Target", url: "https://www.target.com/s?searchTerm=microfiber+cloths" }
    ]
  },
  {
    title: "Homemade Cleaning Solutions That Work",
    url: "https://www.apartmenttherapy.com/homemade-cleaning-solutions-367266",
    type: "tip",
  },
];

function DecorSuggestions() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  useEffect(() => {
    fetch("/decor/suggestions.json")
      .then((res) => res.json())
      .then(setSuggestions);
  }, []);

  return (
    <section style={{ marginTop: 32 }}>
      <h2>Home Decor & Cleaning Suggestions</h2>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {suggestions.map((item, idx) => (
          <div key={idx} style={{ width: 220, border: "1px solid #eee", borderRadius: 8, padding: 12, background: "#faf9f7" }}>
            <img src={item.image} alt={item.title} style={{ width: "100%", borderRadius: 6, marginBottom: 8 }} />
            <strong>{item.title}</strong>
            <p style={{ fontSize: "0.95em", margin: "8px 0" }}>{item.suggestion}</p>
            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: "#0f7cae" }}>See More</a>
          </div>
        ))}
      </div>
    </section>
  );
}

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
            {link.buyLinks && link.buyLinks.map((b: any, i: number) => (
              <span key={b.url || i}>
                {" "}
                <a href={b.url} target="_blank" rel="noopener noreferrer" style={{ color: "#0f5db5", marginLeft: 6, fontSize: "0.95em" }}>
                  [Buy on {b.label}]
                </a>
              </span>
            ))}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: "0.95em", color: "#466581" }}>Know a great tip or product? Suggest it to us for future updates!</p>
      <DecorSuggestions />
    </section>
  );
}
