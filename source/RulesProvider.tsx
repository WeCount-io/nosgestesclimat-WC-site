import {
	EngineProvider,
	SituationProvider,
} from 'Components/utils/EngineContext'
import {
	configSituationSelector,
	situationSelector,
} from 'Selectors/simulationSelectors'

import useBranchData from 'Components/useBranchData'
import Engine from 'publicodes'
import { ReactNode, useEffect, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import { defaultRulesOptions, RulesOptions } from './reducers/rootReducer'

//TODO Deactivated until https://github.com/EmileRolley/publiopti/issues/4 is fixed
//import { constantFolding, getRawNodes } from 'publiopti'
import { addTranslationToBaseRules } from '../nosgestesclimat/scripts/i18n/addTranslationToBaseRules'
import { getCurrentLangAbrv } from './locales/translation'

export default ({ children }) => {
	const { i18n } = useTranslation()
	const currLangAbrv = getCurrentLangAbrv(i18n)
	const branchData = useBranchData()
	const rules = useSelector((state) => state.rules)

	const dispatch = useDispatch()

	const setRules = (rules) => dispatch({ type: 'SET_RULES', rules })

	useEffect(() => {
		if (!branchData.loaded) return
		//This NODE_ENV condition has to be repeated here, for webpack when compiling. It can't interpret shouldUseLocalFiles even if it contains the same variable
		if (NODE_ENV === 'development' && branchData.shouldUseLocalFiles) {
			// TODO: find a way to use compressed models in dev mode
			console.log(
				'===== DEV MODE : the model is on your hard drive on ./nosgestesclimat ======='
			)
			// Rules are stored in nested yaml files
			const req = require.context(
				'../../nosgestesclimat-WC-model/data/',
				true,
				/\.(yaml)$/
			)

			// Bigger rule explanations are stored in nested .md files
			const reqPlus = require.context(
				'raw-loader!../../nosgestesclimat-WC-model/data/actions/plus/',
				true,
				/\.(md)$/
			)

			const plusDottedNames = Object.fromEntries(
				reqPlus
					.keys()
					.map((path) => [
						path.replace(/(\.\/|\.md)/g, ''),
						reqPlus(path).default,
					])
			)

			const rules = req.keys().reduce((memo, key) => {
				const jsonRuleSet = req(key).default || {}
				return { ...memo, ...jsonRuleSet }
			}, {})

			setRules(rules, branchData.deployURL)
		} else {
			const url =
				branchData.deployURL +
				// TODO: find a better way to manage 'en'
				`/co2-${i18n.language === 'en' ? 'en-us' : currLangAbrv}-opti.json`
			console.log('fetching:', url)
			fetch(url, { mode: 'cors' })
				.then((response) => response.json())
				.then((json) => {
					setRules(json, branchData.deployURL)
				})
		}
	}, [
		branchData.deployURL,
		branchData.loaded,
		branchData.shouldUseLocalFiles,
		i18n.language,
	])

	return <EngineWrapper rules={rules}>{children}</EngineWrapper>
}

const EngineWrapper = ({ children }) => {
	const engineState = useSelector((state) => state.engineState)
	const engineRequestedOnce = engineState.state !== null
	const rules = useSelector((state) => state.rules)
	const dispatch = useDispatch()
	const branchData = useBranchData()

	const optimizedOption = engineState?.options?.optimized
	const parsedOption = engineState?.options?.parsed

	const { i18n } = useTranslation()
	const currLangAbrv = getCurrentLangAbrv(i18n)

	useEffect(() => {
		let active = true

		const fetchAndSetRules = () => {
			if (!branchData.loaded) return
			if (!engineRequestedOnce) return

			const url =
				branchData.deployURL +
				// TODO: find a better way to manage 'en'
				`/co2-${i18n.language === 'en' ? 'en-us' : currLangAbrv}${
					optimizedOption ? '-opti' : ''
				}.json`
			console.log('fetching:', url)
			fetch(url, { mode: 'cors' })
				.then((response) => response.json())
				.then((json) => {
					if (active) dispatch({ type: 'SET_RULES', rules: json })
				})
		}
		fetchAndSetRules()
		return () => {
			active = false
		}
	}, [
		dispatch,
		branchData.deployURL,
		branchData.loaded,
		i18n.language,
		optimizedOption,
		engineRequestedOnce,
	])

	const engine = useMemo(() => {
		const shouldParse = engineRequestedOnce && rules && parsedOption
		if (shouldParse) {
			console.log(
				`⚙️ will parse ${Object.keys(rules).length} rules,  expensive operation`
			)
			console.time('⚙️ parsing rules')
			const engine = new Engine(rules)
			console.timeEnd('⚙️ parsing rules')

			return engine
		}
		return false
		// We rely on this useMemo hook to store multiple Engines.
		// Say the test component requests the optimized parsed rules,
		// then the documentation loads the complete rules, then the user
		// goes back to the test component : the Engine shouldn't be parsed again
		// but picked from the hook'e memo.
		// TODO : test this : React says we shouldn't rely on this feature
	}, [engineRequestedOnce, branchData.deployURL, rules, parsedOption])

	useEffect(() => {
		if (engine || (parsedOption === false && rules))
			dispatch({ type: 'SET_ENGINE', to: { ...engineState, state: 'ready' } })
		return
	}, [engine, parsedOption, rules])

	const userSituation = useSelector(situationSelector),
		configSituation = useSelector(configSituationSelector),
		situation = useMemo(
			() => ({
				...configSituation,
				...userSituation,
			}),
			[configSituation, userSituation]
		)

	return (
		<EngineProvider value={engine}>
			<SituationProvider situation={situation}>{children}</SituationProvider>
		</EngineProvider>
	)
}

export const WithEngine = ({ children, fallback = null }) => {
	const dispatch = useDispatch()
	const engineState = useSelector((state) => state.engineState)
	const currentRulesOptions = engineState?.options

	useEffect(() => {
		if (options?.optimized) console.log('🗜️  Optimized rules requested')
		else console.log('💯 Complete rules requested')
		if (
			// This is a fixed point, no interest to go back to optimized at this point
			engineState.state === 'ready' &&
			sameOptions(currentRulesOptions, { optimized: false, parsed: true })
		)
			return
		if (
			engineState.state !== 'ready' ||
			!sameOptions(options, currentRulesOptions)
		)
			dispatch({ type: 'SET_ENGINE', to: { state: 'requested', options } })
		return
	}, [])

	if (engineState !== 'ready') return <div>Chargement du modèle de calcul</div>
	return children
}

const sameOptions = (a, b) => Object.keys(a).every((k) => a[k] === b[k])
