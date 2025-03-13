const regex =
	/[^\p{Letter}\p{Number}\p{Punctuation}\p{Space_Separator}\p{Math_Symbol}\p{Currency_Symbol}\p{Modifier_Symbol}\u2700-\u27BF]/gu;

export function cleanString(input: string): [string, boolean] {
	const normalized = input.normalize();

	const cleanString = normalized.replace(regex, "");

	return [cleanString.trim(), cleanString.length !== normalized.length];
}
