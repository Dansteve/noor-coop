import { NgModule } from '@angular/core';
import { AcronymPipe } from './acronym.pipe';
import { CapWordPipe } from './capitalize.pipe';
import { FormatLoyaltyPipe } from './formatLoyalty.pipe';
import { LastStringPipe } from './lastString.pipe';
import { SegmentURLPipe } from './segmentURL.pipe';
import { UrlifyPipe } from './urlify.pipe';

@NgModule({
    declarations: [
        AcronymPipe,
        LastStringPipe,
        FormatLoyaltyPipe,
        CapWordPipe,
        SegmentURLPipe,
        UrlifyPipe
    ],
    exports: [
        AcronymPipe,
        LastStringPipe,
        FormatLoyaltyPipe,
        CapWordPipe,
        SegmentURLPipe,
        UrlifyPipe
    ]
})

export class SharedPipeModule { }
