import countries from 'i18n-iso-countries'
import fr from 'i18n-iso-countries/langs/fr.json'

countries.registerLocale(fr)

export const countryList = Object.entries(
	countries.getNames('fr', { select: 'official' })
).map(([code, name]) => ({
	code,
	name,
	flag: String.fromCodePoint(
		...[...code].map(c => 0x1f1e6 + c.charCodeAt(0) - 65)
	)
}))
