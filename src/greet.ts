type User = { name: string };

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string"
  );
}

export function greet(json: string): string {
  const data: unknown = JSON.parse(json);

  if (!isUser(data)) {
    throw new Error("name must be a string");
  }
  return `Hello, ${data.name.toUpperCase()}`;
}
