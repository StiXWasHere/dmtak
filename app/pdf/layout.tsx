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
      </head>
      <body className="pdf-form">
        {children}
      </body>
    </html>
  );
}
