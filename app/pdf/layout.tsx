import "./formReport.css";

export default function PdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <style>
          {`
            html {
                font-size: 7pt;
            }

            body {
              font-family: Arial, sans-serif;
              font-size: 7pt;
              color: #000;
            }

            .pdf-form {
              display: flex;
              flex-direction: column;
              gap: 16pt;
            }

            .pdf-section {
              display: flex;
              flex-direction: column;
              gap: 10pt;
              page-break-inside: avoid;
            }

            .pdf-field {
              display: flex;
              flex-direction: column;
              gap: 6pt;
              page-break-inside: avoid;
            }

            .pdf-label {
              font-weight: bold;
            }

            .pdf-img {
              width: 200px;
              max-width: 100%;
              height: auto;
              margin-top: 6pt;
              page-break-inside: avoid;
            }

            .pdf-h1 {
              font-size: 20pt;
              margin-bottom: 10pt;
            }

            .pdf-h2 {
              font-size: 14pt;
              margin-bottom: 6pt;
            }
          `}
        </style>
      </head>
      <body className="pdf-form">
        {children}
      </body>
    </html>
  );
}
