import { useTranslate } from 'i18n-calypso';
import page from 'page';
import DocumentHead from 'calypso/components/data/document-head';
import { getSiteFragment } from 'calypso/lib/route';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import EditTeamMember from './edit-team-member-form';
import InvitePeople from './invite-people';
import PeopleList from './main';
import PeopleInviteDetails from './people-invite-details';
import PeopleInvites from './people-invites';

export default {
	redirectToTeam,

	enforceSiteEnding( context, next ) {
		const siteId = getSiteFragment( context.path );

		if ( ! siteId ) {
			redirectToTeam( context );
		}

		next();
	},

	people( context, next ) {
		renderPeopleList( context, next );
	},

	invitePeople( context, next ) {
		renderInvitePeople( context, next );
	},

	person( context, next ) {
		renderSingleTeamMember( context, next );
	},

	peopleInvites( context, next ) {
		renderPeopleInvites( context, next );
	},

	peopleInviteDetails( context, next ) {
		renderPeopleInviteDetails( context, next );
	},
};

function redirectToTeam( context ) {
	if ( context ) {
		// if we are redirecting we need to retain our intended layout-focus
		const currentLayoutFocus = getCurrentLayoutFocus( context.store.getState() );
		context.store.dispatch( setNextLayoutFocus( currentLayoutFocus ) );
	}
	page.redirect( '/people/team' );
}

function renderPeopleList( context, next ) {
	const PeopleListTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Users', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<PeopleListTitle />
			<PeopleList filter={ context.params.filter } search={ context.query.s } />
		</>
	);
	next();
}

function renderInvitePeople( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	const InvitePeopleTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Invite People', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<InvitePeopleTitle />
			<InvitePeople key={ site.ID } site={ site } />
		</>
	);
	next();
}

function renderPeopleInvites( context, next ) {
	const PeopleInvitesTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Invites', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<PeopleInvitesTitle />
			<PeopleInvites />
		</>
	);
	next();
}

function renderPeopleInviteDetails( context, next ) {
	const PeopleInviteDetailsTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Invite Details', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<PeopleInviteDetailsTitle />
			<PeopleInviteDetails inviteKey={ context.params.invite_key } />
		</>
	);
	next();
}

function renderSingleTeamMember( context, next ) {
	const SingleTeamMemberTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'View Team Member', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<SingleTeamMemberTitle />
			<EditTeamMember userLogin={ context.params.user_login } />
		</>
	);
	next();
}
