<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call(MApprovalTypeSeeder::class);
        $this->call(MClothesSizeSeeder::class);
        $this->call(MCoachQualificationsSeeder::class);
        $this->call(MCountriesSeeder::class);
        $this->call(MDisabilityTypeSeeder::class);
        $this->call(MEventsSeeder::class);
        $this->call(MLanguageProficiencySeeder::class);
        $this->call(MLanguagesSeeder::class);
        $this->call(MNotificationDestinationTypeSeeder::class);
        $this->call(MOrganizationClassSeeder::class);
        $this->call(MOrganizationTypeSeeder::class);
        $this->call(MPrefecturesSeeder::class);
        $this->call(MRaceClassSeeder::class);
        $this->call(MRaceResultNotesSeeder::class);
        $this->call(MRefereeQualificationsSeeder::class);
        $this->call(MSeatNumberSeeder::class);
        $this->call(MSexSeeder::class);
        $this->call(MSideInfoSeeder::class);
        $this->call(MStaffTypeSeeder::class);
        $this->call(MVenueSeeder::class);
        $this->call(MVolunteerQualificationsSeeder::class);
        $this->call(MWeatherTypeSeeder::class);
        $this->call(MWindDirectionSeeder::class);
        $this->call(TUsersSeeder::class);
    }
}
