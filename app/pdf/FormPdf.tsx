// app/pdf/FormPdf.tsx

type Props = {
  form: Form;
};

export default function FormPdf({ form }: Props) {
  return (

      <div className="pdf-form">
        <h1 className="pdf-h1">{form.type}</h1>

        <div className="pdf-section">
          <h2 className="pdf-h2">{form.title}</h2>

          {form.generalSection.map(field => (
            <div key={field.fieldId} className="pdf-field">
              <h3 className="pdf-label">{field.title}:</h3>
              <span className="pdf-value">
                Satus: {field.selected ?? "-"}
              </span>
              <p className="pdf-comment">Kommentar: {field.comment ?? ""}</p>
              {field.imgUrl && (
                <img className="pdf-img" src={field.imgUrl} alt="Bild saknas" />                      
              )}
            </div>
          ))}
        </div>

        {form.roofSides && form.roofSides.map(side => (
          <div key={side.id} className="section">
            <h2 className="pdf-h1">{side.name}</h2>

            {side.sections.map(section => (
              <div className="pdf-section" key={section.id}>
                <h2 className="pdf-h2">{section.title}</h2>

                {section.fields.map(field => (
                  <div key={field.fieldId} className="pdf-field">
                    <h3 className="pdf-label">{field.title}:</h3>
                    <span className="pdf-value">
                      Status: {field.selected ?? "-"}
                    </span>
                    <p className="pdf-comment">Kommentar: {field.comment ?? ""}</p>
                    {field.imgUrl && (
                      <img className="pdf-img" src={field.imgUrl} alt="Bild saknas" />                      
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
  );
}
