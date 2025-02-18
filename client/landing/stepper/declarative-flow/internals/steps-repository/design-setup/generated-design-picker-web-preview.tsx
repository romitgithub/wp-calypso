import {
	getDesignPreviewUrl,
	DEFAULT_VIEWPORT_WIDTH,
	DEFAULT_VIEWPORT_HEIGHT,
	MOBILE_VIEWPORT_WIDTH,
} from '@automattic/design-picker';
import { useViewportMatch } from '@wordpress/compose';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import WebPreview from 'calypso/components/web-preview/content';
import PreviewToolbar from './preview-toolbar';
import type { SiteDetails } from '@automattic/data-stores';
import type { Design } from '@automattic/design-picker';

interface GeneratedDesignPickerWebPreviewProps {
	site?: SiteDetails | null;
	design: Design;
	locale: string;
	verticalId: string;
	isSelected: boolean;
	isPrivateAtomic?: boolean;
	isStickyToolbar?: boolean;
	recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
}

const GeneratedDesignPickerWebPreview: React.FC< GeneratedDesignPickerWebPreviewProps > = ( {
	site,
	design,
	locale,
	verticalId,
	isSelected,
	isPrivateAtomic,
	isStickyToolbar,
	recordTracksEvent,
} ) => {
	const translate = useTranslate();
	const isMobile = ! useViewportMatch( 'small' );

	return (
		<WebPreview
			className={ classnames( { 'is-selected': isSelected } ) }
			showPreview
			showClose={ false }
			showEdit={ false }
			showDeviceSwitcher={ false }
			previewUrl={ getDesignPreviewUrl( design, {
				language: locale,
				vertical_id: verticalId,
				viewport_width: isMobile ? MOBILE_VIEWPORT_WIDTH : DEFAULT_VIEWPORT_WIDTH,
				viewport_height: DEFAULT_VIEWPORT_HEIGHT,
			} ) }
			loadingMessage={ translate( '{{strong}}One moment, please…{{/strong}} loading your site.', {
				components: { strong: <strong /> },
			} ) }
			toolbarComponent={ PreviewToolbar }
			fetchpriority={ isSelected ? 'high' : 'low' }
			autoHeight
			siteId={ site?.ID }
			url={ site?.URL }
			fixedViewportWidth={ ! isMobile ? DEFAULT_VIEWPORT_WIDTH : undefined }
			isPrivateAtomic={ isPrivateAtomic }
			isStickyToolbar={ isSelected && isStickyToolbar }
			translate={ translate }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default GeneratedDesignPickerWebPreview;
