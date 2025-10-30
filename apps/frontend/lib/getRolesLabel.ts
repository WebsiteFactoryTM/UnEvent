export const getRolesLabel = (roles: string[]) => {
  const roleLabels = {
    client: "Client / Participant",
    host: "Proprietar locație",
    provider: "Furnizor servicii",
    organizer: "Organizator evenimente",
    admin: "Administrator",
  };
  return roles.map((role) => roleLabels[role as keyof typeof roleLabels]);
};
