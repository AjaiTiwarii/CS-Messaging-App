export function getAgentName(): string | null {
  return localStorage.getItem("agentName");
}

export function setAgentName(name: string) {
  localStorage.setItem("agentName", name);
}
