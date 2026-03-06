// app/pdf/FormPdf.tsx
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

type Props = {
  form: Form;
};

const styles = StyleSheet.create({
  page: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#000",
    // reserve space for header and footer so content won't overlap
    paddingTop: 100,
    paddingBottom: 70,
    paddingHorizontal: 36,
  },
  header: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    alignItems: "center",
  },
    footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    alignItems: "center",
    fontSize: 8,
    color: "#555",
  },
  form: {
    gap: 16,
  },

  section: {
    gap: 10,
    marginBottom: 16,
  },

  field: {
    gap: 6,
    marginBottom: 6,
  },

  h1: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },

  h2: {
    fontSize: 14,
    marginVertical: 6,
    fontWeight: "bold",
  },

  centerText: {
    textAlign: "center",
  },

  introductionSection: {
    marginBottom: 12,
    gap: 8,
  },

  introductionText: {
    fontSize: 10,
    lineHeight: 1.4,
  },

  participants: {
    fontSize: 10,
    fontWeight: "bold",
  },

  dateSection: {
    marginBottom: 12,
    textAlign: "right",
  },

  label: {
    fontWeight: "bold",
    fontSize: 10,
  },

  statusApproved: {
    color: "green",
    fontSize: 10,
  },

  statusRejected: {
    color: "red",
    fontSize: 10,
  },

  status: {
    color: "#000",
    fontSize: 10,
  },

  img: {
    width: 180,
    marginTop: 6,
  },
});

export default function FormPdf({ form }: Props) {
  const logoUrl = `${process.env.APP_URL}/dmtaklogo.png`;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Image src={logoUrl} style={{ width: 160 }} />
        </View>
        {/* Main content */}
        <View style={styles.form}>
          <Text style={[styles.h1, styles.centerText]}>{form.type}</Text>

          {form.createdAt && (
            <View style={styles.dateSection}>
              <Text style={styles.introductionText}>
                Skapad {new Date(form.createdAt).toLocaleString("sv-SE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </Text>
            </View>
          )}

          {/* Introduction section */}
          <View style={styles.introductionSection}>
            <Text style={styles.introductionText}>
              Detta dokument är ett internt kontrollprotokoll upprättat av DM TAK inom ramen för vår kvalitetssäkring. 
              Syftet med kontrollen är att säkerställa att arbetet är rätt utfört och följer DM TAKS kvalitetsstandard.
            </Text>
            <Text style={styles.introductionText}>
              Vid noterade fel eller brister, ska dessa åtgärdas innan man fortsätter med annat arbete och bekräftas med bild och/eller video till kontrollant att de är åtgärdade.
            </Text>
            <Text style={styles.introductionText}>
              Kontrollen är en del av vår egen kvalitetssäkring och ska inte likställas med en oberoende slutbesiktning. 
              Protokollet baseras på okulär besiktning vid kontrolltillfället. 
              Eventuella dolda konstruktioner eller delar som inte varit åtkomliga omfattas inte av denna genomgång.
            </Text>
          </View>

          {/* General section */}
          <View style={styles.section}>
            <Text style={styles.h2}>{form.title}</Text>
            {form.ownerName && (
              <Text style={styles.participants}>
                Besiktning utförd av {form.ownerName}
              </Text>
            )}
            <Text style={styles.participants}>
              Deltagare:
            </Text>
            {form.customerParticipants && (
              <Text style={styles.introductionText}>
                Kund - {form.customerParticipants}
              </Text>
            )}

            {form.workerParticipants && (
              <Text style={styles.introductionText}>
                Underentrepenör - {form.workerParticipants}
              </Text>
            )}

            {form.generalSection
              .filter((field) => field.selected && field.selected !== "Ej aktuellt" && field.selected !== "Ej utförd")
              .map((field) => (
              <View key={field.fieldId} style={styles.field} wrap={false}>
                <Text style={styles.label}>{field.title}:</Text>

                {field.selected ? (
                  <Text
                    style={
                      field.selected === "Godkänt" || field.selected === "Avhjälpt"
                        ? styles.statusApproved
                        : field.selected === "Ej godkänt"
                        ? styles.statusRejected
                        : styles.status
                    }
                  >
                    {field.selected === "Godkänt" || field.selected === "Avhjälpt"
                      ? "OK "
                      : field.selected === "Ej godkänt"
                      ? "X "
                      : ""}
                    Status: {field.selected}
                  </Text>
                ) : (
                  <Text style={styles.status}>Status: -</Text>
                )}

                {field.comment && (
                  <Text>Kommentar: {field.comment}</Text>
                )}

                {field.imgUrl && (
                  <Image src={field.imgUrl} style={styles.img} />
                )}
              </View>
            ))}
          </View>

          {/* Roof sides */}
          {form.roofSides?.map((side) => (
            <View key={side.id} style={styles.section}>
              <Text style={styles.h1}>{side.name}</Text>

              {side.sections
                .filter((section) => section.fields.some((field) => field.selected && field.selected !== "Ej aktuellt" && field.selected !== "Ej utfört"))
                .map((section) => (
                <View key={section.id} style={styles.section}>
                  <Text style={styles.h2}>{section.title}</Text>

                  {section.fields
                    .filter((field) => field.selected && field.selected !== "Ej aktuellt" && field.selected !== "Ej utfört")
                    .map((field) => (
                    <View
                      key={field.fieldId}
                      style={styles.field}
                      wrap={false}
                    >
                      <Text style={styles.label}>{field.title}:</Text>

                      {field.selected ? (
                        <Text
                          style={
                            field.selected === "Godkänt" || field.selected === "Avhjälpt"
                              ? styles.statusApproved
                              : field.selected === "Ej godkänt"
                              ? styles.statusRejected
                              : styles.status
                          }
                        >
                          {field.selected === "Godkänt" || field.selected === "Avhjälpt"
                            ? "OK "
                            : field.selected === "Ej godkänt"
                            ? "X "
                            : ""}
                          Status: {field.selected}
                        </Text>
                      ) : (
                        <Text style={styles.status}>Status: -</Text>
                      )}

                      {field.comment && (
                        <Text>Kommentar: {field.comment}</Text>
                      )}

                      {field.imgUrl && (
                        <Image
                          src={field.imgUrl}
                          style={styles.img}
                        />
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
        {/* Footer with page number */}
        <View
          style={styles.footer}
          fixed
        >
          <Text
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
