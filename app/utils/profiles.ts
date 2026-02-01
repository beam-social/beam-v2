
export const isYoungerThan18 = (birthdate: Date): boolean => {
	const currentDate = new Date()

	const diffTime = Math.abs(currentDate.getTime() - birthdate.getTime())
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

	return diffDays < 6570 // 18 ans en jours
}

export const grades = [
	'Banni',
	'Banni temporairement',
	'Restreint',
	'Membre',
	'Premium',
	'Certifié',
	'Modération',
	'Super Modération',
	'Équipe',
	'Fondateur'
]
