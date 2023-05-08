export default function decorate(block) {
  const div = document.createRange().createContextualFragment(`
    <h1>FAQs</h1>
    <div itemscope itemtype="http://schema.org/WebPage" class="breadcrumb">
      <div itemprop="breadcrumb" class="breadcumb-items">
        <a href="/area-vip">Área VIP</a>
        ·
        <span>FAQs</span>
      </div>
      <script type="application/ld+json">
        {
          "@context": "http://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement":
          [
        {
                    "@type": "ListItem",
                    "item":
                    {
                      "@id": "/area-vip",
                      "name": "Área VIP"
                    },
                    "position": "0"
                  },
            {
              "@type": "ListItem",
              "item": {
                "@id": "/area-vip/faq",
                "name": "FAQs"
              },
              "position":"1"
            }
          ]
        }
      </script>
    </div>
  `);
  block.textContent = '';
  block.append(div);
}
