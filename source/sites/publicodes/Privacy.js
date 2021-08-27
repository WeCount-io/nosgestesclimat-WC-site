import React from 'react'
import Meta from '../../components/utils/Meta'

export default () => (
	<div>
		<Meta
			title="Données personnelles"
			description="Nos gestes climat fonctionne sans serveur, donc vos données restent chez vous. Nous collectons anonymement des données aggregées pour améliorer le simulateur."
		/>
		<h1>Données personnelles</h1>
		<p>
			A la fin de la simulation, nous vous proposons ou bien de partager votre simulation ou bien de ne pas la partager. Nous vous prions de partager votre simulation la plus proche de la réalité de vos habitudes afin de pouvoir inclure ces résultats dans le bilan carbone de l'entreprise. Nous ne collectons uniquement les données nécessaires au calcul du bilan carbone de l'entreprise.
		</p>
		<p>
			Si vous décidez de ne pas partager votre simulation, alors nous ne collectons aucune donnée.
		</p>

		<iframe
			css="border: 0; height: 200px; width: 600px;"
			src="https://stats.data.gouv.fr/index.php?module=CoreAdminHome&action=optOut&language=fr&backgroundColor=&fontColor=&fontSize=&fontFamily="
		></iframe>
	</div>
)
