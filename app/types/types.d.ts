type User = {
    id: string;
    emailAddresses: { emailAddress: string }[];
    publicMetadata: { role?: string };
    fName?: string;
    lName?: string;
}
type Project = {
    id: string;
    title: string;
    createdAt: number;
    forms: Form[];
    ownerId: string;
}
type Form = {
    id: string;
    title: string;
    type: 'Delbesiktning' | 'Slutbesiktning' | 'Egenkontroll' | 'Takfall';
    createdAt: number;
    projectId: string;
    generalSectionTitle: string;
    generalSection: FormField[];
    roofSides?: RoofSide[];
}
type FormSection = {
    id: string;
    title: string;
    fields: FormField[];
}
type FormField = {
    title: string;
    fieldId: string;
    options?: Array<'Godkänt', 'Ej godkänt', 'Ej aktuellt', 'Avhjälpt'>;
    selected?: string;
    comment?: string;
    imgUrl?: string;
}
type RoofSide = {
    id: string;
    name: string;
    sections: FormSection[];
}
type FormTemplate = {
    id: string;
    title: string;
    type: 'Delbesiktning' | 'Slutbesiktning' | 'Egenkontroll';
    generalSectionTitle: string;
    generalSection: FormFieldTemplate[];
    createdAt: number;
    ownerId: string; // optional
};
type FormSectionTemplate = {
    id: string;
    title: string;
    fields: FormFieldTemplate[];
}
type FormFieldTemplate = {
    title: string;
    fieldId: string;
};
type FormEdits = {
  [fieldId: string]: {
    selected: string;
    comment: string;
    imgUrl?: string;
  };
};


