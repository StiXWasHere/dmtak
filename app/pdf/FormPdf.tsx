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
    fontSize: 7,
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
          <Text style={styles.h1}>{form.type}</Text>

          {/* General section */}
          <View style={styles.section}>
            <Text style={styles.h2}>{form.title}</Text>

            {form.generalSection
              .filter((field) => field.selected)
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
                .filter((section) => section.fields.some((field) => field.selected))
                .map((section) => (
                <View key={section.id} style={styles.section}>
                  <Text style={styles.h2}>{section.title}</Text>

                  {section.fields
                    .filter((field) => field.selected)
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
