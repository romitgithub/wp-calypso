import { Card, Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import i18n, { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import { Component } from 'react';
import { connect } from 'react-redux';
import phoneValidation from 'calypso/lib/phone-validation';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import userAgent from 'calypso/lib/user-agent';
import ReauthRequired from 'calypso/me/reauth-required';
import { accountRecoverySettingsFetch } from 'calypso/state/account-recovery/settings/actions';
import {
	getAccountRecoveryPhone,
	isAccountRecoverySettingsReady,
} from 'calypso/state/account-recovery/settings/selectors';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import { sendEmailLogin } from 'calypso/state/auth/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getCountries from 'calypso/state/selectors/get-countries';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import hasUserSettings from 'calypso/state/selectors/has-user-settings';
import { fetchUserSettings } from 'calypso/state/user-settings/actions';
import AppsBadge from './apps-badge';

function sendSMS( phone ) {
	function onSuccess( dispatch ) {
		dispatch( successNotice( i18n.translate( 'SMS Sent. Go check your messages!' ) ) );
	}

	function onFailure( dispatch ) {
		dispatch(
			errorNotice( i18n.translate( 'We couldn’t send the SMS — double check your number.' ) )
		);
	}

	return http( {
		method: 'POST',
		apiNamespace: 'wpcom/v2',
		path: '/me/get-apps/send-download-sms',
		body: { phone },
		onSuccess,
		onFailure,
	} );
}

class MobileDownloadCard extends Component {
	static propTypes = {
		translate: PropTypes.func,
		countriesList: PropTypes.array.isRequired,
		storedPhone: PropTypes.shape( {
			countryCode: PropTypes.string,
			countryNumericCode: PropTypes.string,
			number: PropTypes.string,
			numberFull: PropTypes.string,
			isValid: PropTypes.bool,
		} ),
		hasLoadedStoredPhone: PropTypes.bool,
		hasSendingError: PropTypes.bool,
	};

	state = {
		phoneNumber: null,
	};

	componentDidMount() {
		twoStepAuthorization.on( 'change', this.maybeFetchAccountRecoverySettings );
		this.maybeFetchAccountRecoverySettings();
	}

	componentWillUnmount() {
		twoStepAuthorization.off( 'change', this.maybeFetchAccountRecoverySettings );
	}

	maybeFetchAccountRecoverySettings = () => {
		const hasReauthData = twoStepAuthorization.data ? true : false;
		const needsReauth = hasReauthData ? twoStepAuthorization.isReauthRequired() : true;

		if ( needsReauth === false ) {
			this.props.fetchUserSettings();
			this.props.accountRecoverySettingsFetch();
		}
	};

	getPreferredNumber = () => {
		const noPreferredNumber = {
			countryCode: null,
			countryNumericCode: null,
			number: null,
			numberFull: null,
			isValid: false,
		};

		if ( ! this.userSettingsHaveBeenLoadedWithAccountRecoveryPhone() ) {
			return noPreferredNumber;
		}

		const tfaNumber =
			this.props.userSettings != null ? this.props.userSettings.two_step_sms_phone_number : null;

		const tfaCountryCode =
			this.props.userSettings != null ? this.props.userSettings.two_step_sms_country : null;

		const tfaSMSEnabled =
			this.props.userSettings != null ? this.props.userSettings.two_step_sms_enabled : null;

		const accountRecoveryNumber = this.props.accountRecoveryPhone;

		// If the user has typed their own phone number,
		// that's the most preferred.
		if ( this.state.phoneNumber !== null ) {
			return this.state.phoneNumber;
		}

		// We proritize TFA over the account recovery number.
		// Also, if we have their TFA phone number, but they're not using
		// it for TFA, we won't show it to them, to avoid creeping them out.
		if ( tfaNumber !== null && tfaCountryCode !== null && tfaSMSEnabled ) {
			const countryCode = this.numericCountryCodeForCountryCode( tfaCountryCode );
			const fullNumber = countryCode + tfaNumber;

			return {
				countryCode: tfaCountryCode,
				countryNumericCode: countryCode,
				number: tfaNumber,
				numberFull: fullNumber,
				isValid: this.phoneNumberIsValid( fullNumber ),
			};
		}

		// Account recovery number already has the keys formatted in the
		// way we want, so we can just return it directly.
		if ( accountRecoveryNumber !== null ) {
			const isValid = this.phoneNumberIsValid( accountRecoveryNumber.numberFull );
			accountRecoveryNumber.isValid = isValid;

			return accountRecoveryNumber;
		}

		// Fallback if we didn't match anything
		return noPreferredNumber;
	};

	phoneNumberIsValid( number ) {
		return ! phoneValidation( number ).error;
	}

	numericCountryCodeForCountryCode( code ) {
		const element = this.props.countriesList.find( ( item ) => {
			return item.code === code;
		} );

		if ( element !== undefined ) {
			return element.numeric_code;
		}

		return null;
	}

	userSettingsHaveBeenLoadedWithAccountRecoveryPhone() {
		return this.props.hasUserSettings && this.props.hasLoadedAccountRecoveryPhone;
	}

	render() {
		const { translate } = this.props;

		const { isMobile } = userAgent;
		const featureIsEnabled = ! isMobile;

		return (
			<Card className="get-apps__mobile">
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<div className="get-apps__store-subpanel">
					<div className="get-apps__card-text">
						<h3 className="get-apps__card-title">{ translate( 'Mobile Apps' ) }</h3>
						<p className="get-apps__description">
							{ translate( 'WordPress at your fingertips.' ) }
						</p>
					</div>
					<div className="get-apps__badges">
						<AppsBadge storeName={ 'android' } utm_source={ 'calypso-get-apps' } />
						<AppsBadge storeName={ 'ios' } utm_source={ 'calypso-get-apps-button' } />
					</div>
				</div>

				{ featureIsEnabled && (
					<div className="get-apps__qr-code-subpanel">
						<p>
							<strong>{ translate( 'Ready to WordPress on the go?' ) }</strong>
							<br />
							{ translate( 'Scan the code using your mobile phone to download the app.' ) }
						</p>

						<QRCode
							value={ localizeUrl(
								'https://apps.wordpress.com/mobile/?campaign=calypso-qrcode-apps'
							) }
							size={ 180 }
						/>
					</div>
				) }

				<div className="get-apps__magic-link-subpanel">
					<div className="get-apps__card-text">
						<p>
							<strong>{ translate( 'Instantly log in to the mobile app' ) }</strong>
							<br />
							{ translate(
								'Send yourself links to download the app and instantly log in on your mobile device.'
							) }
						</p>
					</div>
					<div>
						<Button className="get-apps__magic-link-button" onClick={ this.onSubmitLink }>
							{ translate( 'Email me a log in link' ) }
						</Button>
					</div>
				</div>
			</Card>
		);
	}

	onChange = ( phoneNumber ) => {
		this.setState( {
			phoneNumber: {
				countryCode: phoneNumber.countryData.code,
				countryNumericCode: phoneNumber.countryData.numeric_code,
				number: phoneNumber.phoneNumber,
				numberFull: phoneNumber.phoneNumberFull,
				isValid: phoneNumber.isValid,
			},
		} );
	};

	onKeyUp = ( event ) => {
		if ( event.key === 'Enter' ) {
			this.onSubmit( event );
		}
	};

	onSubmit = () => {
		const phoneNumber = this.getPreferredNumber().numberFull;
		this.props.sendSMS( phoneNumber );
	};

	onSubmitLink = () => {
		const email = this.props.userSettings.user_email;
		this.props.sendMagicLink( email );
	};
}

const sendMagicLink = ( email ) =>
	withAnalytics(
		recordTracksEvent( 'calypso_get_apps_magic_link_button_click' ),
		sendEmailLogin( email, { showGlobalNotices: true, isMobileAppLogin: true } )
	);

export default connect(
	( state ) => ( {
		countriesList: getCountries( state, 'sms' ),
		accountRecoveryPhone: getAccountRecoveryPhone( state ),
		hasLoadedAccountRecoveryPhone: isAccountRecoverySettingsReady( state ),
		userSettings: getUserSettings( state ),
		hasUserSettings: hasUserSettings( state ),
	} ),
	{ sendSMS, sendMagicLink, fetchUserSettings, accountRecoverySettingsFetch, recordTracksEvent }
)( localize( MobileDownloadCard ) );
