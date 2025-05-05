window.SettingsView = {
    template: `
        <div class="settings-view animate__animated animate__fadeIn">
            <div class="row g-4">
                <div class="col-md-3">
                    <!-- Navegació secundària de configuració -->
                    <div class="card">
                        <div class="card-header">
                            <h5 class="m-0">Settings</h5>
                        </div>
                        <div class="list-group list-group-flush">
                            <a href="#"
                                class="list-group-item list-group-item-action d-flex align-items-center"
                                :class="{'active': activeSection === 'profile'}"
                                @click.prevent="activeSection = 'profile'">
                                <i class="bi bi-person me-3"></i> Profile
                            </a>
                            <a href="#"
                                class="list-group-item list-group-item-action d-flex align-items-center"
                                :class="{'active': activeSection === 'preferences'}"
                                @click.prevent="activeSection = 'preferences'">
                                <i class="bi bi-sliders me-3"></i> Preferences
                            </a>
                            <a href="#"
                                class="list-group-item list-group-item-action d-flex align-items-center"
                                :class="{'active': activeSection === 'notifications'}"
                                @click.prevent="activeSection = 'notifications'">
                                <i class="bi bi-bell me-3"></i> Notifications
                            </a>
                            <a href="#"
                                class="list-group-item list-group-item-action d-flex align-items-center"
                                :class="{'active': activeSection === 'integrations'}"
                                @click.prevent="activeSection = 'integrations'">
                                <i class="bi bi-box-seam me-3"></i> Integrations
                            </a>
                            <a href="#"
                                class="list-group-item list-group-item-action d-flex align-items-center"
                                :class="{'active': activeSection === 'billing'}"
                                @click.prevent="activeSection = 'billing'">
                                <i class="bi bi-credit-card me-3"></i> Billing
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-md-9">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="m-0">
                                {{ sectionTitle }}
                            </h5>
                            <div v-if="showSaveButton">
                                <button class="btn btn-sm btn-primary" @click="saveSettings">
                                    <i class="bi bi-check-lg me-1"></i> Save Changes
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <!-- Contingut de configuració del perfil. Mostrat quan activeSection és 'profile'. -->
                            <div v-if="activeSection === 'profile'">
                                <p>Manage your account profile and settings.</p>
                                <div class="mb-4 text-center">
                                    <img :src="user.avatarUrl" class="rounded-circle mb-3" alt="Profile Picture">
                                    <div>
                                        <button class="btn btn-sm btn-outline-primary" @click="changeProfilePicture">
                                            Change Picture
                                        </button>
                                    </div>
                                </div>
                                <form @submit.prevent="saveProfile">
                                    <div class="mb-3">
                                        <label for="fullName" class="form-label">Full Name</label>
                                        <input type="text" class="form-control" id="fullName" v-model="user.name">
                                    </div>
                                    <div class="mb-3">
                                        <label for="email" class="form-label">Email</label>
                                        <input type="email" class="form-control" id="email" v-model="user.email">
                                    </div>
                                    <div class="mb-3">
                                        <label for="timezone" class="form-label">Timezone</label>
                                        <select class="form-select" id="timezone" v-model="user.timezone">
                                            <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                                                {{ tz.label }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="bio" class="form-label">Bio</label>
                                        <textarea class="form-control" id="bio" rows="3" v-model="user.bio"></textarea>
                                        <small class="form-text text-muted">Tell us a little about yourself.</small>
                                    </div>
                                </form>
                            </div>

                            <!-- Contingut de preferències. Mostrat quan activeSection és 'preferences'. -->
                            <div v-else-if="activeSection === 'preferences'">
                                <p>Customize your app experience.</p>

                                <h6 class="mb-3">Theme</h6>
                                <div class="mb-4">
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" name="theme"
                                               id="themeLight" value="light" v-model="preferences.theme">
                                        <label class="form-check-label" for="themeLight">Light</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" name="theme"
                                               id="themeDark" value="dark" v-model="preferences.theme">
                                        <label class="form-check-label" for="themeDark">Dark</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" name="theme"
                                               id="themeSystem" value="system" v-model="preferences.theme">
                                        <label class="form-check-label" for="themeSystem">System</label>
                                    </div>
                                </div>

                                <h6 class="mb-3">Language</h6>
                                <div class="mb-4">
                                    <select class="form-select" v-model="preferences.language">
                                        <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                                            {{ lang.name }}
                                        </option>
                                    </select>
                                </div>

                                <h6 class="mb-3">Application Preferences</h6>
                                <div class="mb-4">
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="startPagePref"
                                               v-model="preferences.startOnDashboard">
                                        <label class="form-check-label" for="startPagePref">Start on Dashboard</label>
                                    </div>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="soundsPref"
                                               v-model="preferences.enableSounds">
                                        <label class="form-check-label" for="soundsPref">Enable sounds</label>
                                    </div>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="animationsPref"
                                               v-model="preferences.enableAnimations">
                                        <label class="form-check-label" for="animationsPref">Enable animations</label>
                                    </div>
                                </div>
                            </div>

                            <!-- Contingut de notificacions. Mostrat quan activeSection és 'notifications'. -->
                            <div v-else-if="activeSection === 'notifications'">
                                <p>Configure how and when you receive notifications.</p>

                                <h6 class="mb-3">Email Notifications</h6>
                                <div class="mb-4">
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="emailTaskAssigned"
                                               v-model="notifications.emailTaskAssigned">
                                        <label class="form-check-label" for="emailTaskAssigned">
                                            When a task is assigned to me
                                        </label>
                                    </div>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="emailTaskDue"
                                               v-model="notifications.emailTaskDue">
                                        <label class="form-check-label" for="emailTaskDue">
                                            When a task is due soon
                                        </label>
                                    </div>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="emailWeeklySummary"
                                               v-model="notifications.emailWeeklySummary">
                                        <label class="form-check-label" for="emailWeeklySummary">
                                            Weekly activity summary
                                        </label>
                                    </div>
                                </div>

                                <h6 class="mb-3">In-App Notifications</h6>
                                <div class="mb-4">
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="inAppComments"
                                               v-model="notifications.inAppComments">
                                        <label class="form-check-label" for="inAppComments">
                                            When someone comments on my task
                                        </label>
                                    </div>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="inAppMentions"
                                               v-model="notifications.inAppMentions">
                                        <label class="form-check-label" for="inAppMentions">
                                            When I'm mentioned in a comment
                                        </label>
                                    </div>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="inAppStatusUpdates"
                                               v-model="notifications.inAppStatusUpdates">
                                        <label class="form-check-label" for="inAppStatusUpdates">
                                            When task status changes
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Contingut d'integracions. Mostrat quan activeSection és 'integrations'. -->
                            <div v-else-if="activeSection === 'integrations'">
                                <p>Connect your time.it account with other services.</p>

                                <div class="list-group mb-4">
                                    <div class="list-group-item d-flex justify-content-between align-items-center">
                                        <div class="d-flex align-items-center">
                                            <i class="bi bi-google fs-4 me-3"></i>
                                            <div>
                                                <h6 class="mb-0">Google Calendar</h6>
                                                <small class="text-muted">Sync events and deadlines</small>
                                            </div>
                                        </div>
                                        <button class="btn btn-sm"
                                                :class="integrations.googleCalendar ? 'btn-danger' : 'btn-success'"
                                                @click="toggleIntegration('googleCalendar')">
                                            {{ integrations.googleCalendar ? 'Disconnect' : 'Connect' }}
                                        </button>
                                    </div>
                                    <div class="list-group-item d-flex justify-content-between align-items-center">
                                        <div class="d-flex align-items-center">
                                            <i class="bi bi-microsoft fs-4 me-3"></i>
                                            <div>
                                                <h6 class="mb-0">Microsoft Teams</h6>
                                                <small class="text-muted">Share tasks and updates with your team</small>
                                            </div>
                                        </div>
                                        <button class="btn btn-sm"
                                                :class="integrations.microsoftTeams ? 'btn-danger' : 'btn-success'"
                                                @click="toggleIntegration('microsoftTeams')">
                                            {{ integrations.microsoftTeams ? 'Disconnect' : 'Connect' }}
                                        </button>
                                    </div>
                                    <div class="list-group-item d-flex justify-content-between align-items-center">
                                        <div class="d-flex align-items-center">
                                            <i class="bi bi-slack fs-4 me-3"></i>
                                            <div>
                                                <h6 class="mb-0">Slack</h6>
                                                <small class="text-muted">Get notifications and updates in Slack</small>
                                            </div>
                                        </div>
                                        <button class="btn btn-sm"
                                                :class="integrations.slack ? 'btn-danger' : 'btn-success'"
                                                @click="toggleIntegration('slack')">
                                            {{ integrations.slack ? 'Disconnect' : 'Connect' }}
                                        </button>
                                    </div>
                                </div>

                                <p class="text-muted">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Visit the <a href="#">integrations marketplace</a> to discover more integrations.
                                </p>
                            </div>

                            <!-- Contingut de facturació. Mostrat quan activeSection és 'billing'. -->
                            <div v-else-if="activeSection === 'billing'">
                                <div class="alert alert-info">
                                    <i class="bi bi-info-circle me-2"></i>
                                    You are currently on the <strong>Free</strong> plan. Upgrade for more features.
                                </div>

                                <div class="row g-4 mb-4">
                                    <div class="col-md-4">
                                        <div class="card h-100">
                                            <div class="card-header">
                                                <h5 class="m-0">Free</h5>
                                            </div>
                                            <div class="card-body">
                                                <h3 class="card-title text-center mb-4">$0<small class="text-muted">/mo</small></h3>
                                                <ul class="list-unstyled">
                                                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Up to 5 projects</li>
                                                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Basic task management</li>
                                                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Calendar view</li>
                                                    <li class="mb-2 text-muted"><i class="bi bi-x-circle-fill text-muted me-2"></i> No team collaboration</li>
                                                    <li class="mb-2 text-muted"><i class="bi bi-x-circle-fill text-muted me-2"></i> No advanced features</li>
                                                </ul>
                                            </div>
                                            <div class="card-footer text-center">
                                                <button class="btn btn-outline-secondary" disabled>Current Plan</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="card h-100 border-primary">
                                            <div class="card-header bg-primary text-white">
                                                <h5 class="m-0">Pro</h5>
                                            </div>
                                            <div class="card-body">
                                                <h3 class="card-title text-center mb-4">$9.99<small class="text-muted">/mo</small></h3>
                                                <ul class="list-unstyled">
                                                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Unlimited projects</li>
                                                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Advanced task management</li>
                                                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Calendar & Gantt views</li>
                                                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Basic team collaboration</li>
                                                    <li class="mb-2 text-muted"><i class="bi bi-x-circle-fill text-muted me-2"></i> No AI features</li>
                                                </ul>
                                            </div>
                                            <div class="card-footer text-center">
                                                <button class="btn btn-primary" @click="upgradePlan('pro')">Upgrade</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="card h-100">
                                            <div class="card-header bg-info text-white">
                                                <h5 class="m-0">Business</h5>
                                            </div>
                                            <div class="card-body">
                                                <h3 class="card-title text-center mb-4">$29.99<small class="text-muted">/mo</small></h3>
                                                <ul class="list-unstyled">
                                                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Everything in Pro</li>
                                                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Advanced team features</li>
                                                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Smart AI planner</li>
                                                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Advanced analytics</li>
                                                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Priority support</li>
                                                </ul>
                                            </div>
                                            <div class="card-footer text-center">
                                                <button class="btn btn-outline-info" @click="upgradePlan('business')">Upgrade</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    props: {
        currentSubView: String
    },
    data() {
        return {
            // Secció activa actual per controlar quina part de la configuració es mostra.
            activeSection: 'profile',
            // Objecte per emmagatzemar les dades del perfil de l'usuari.
            user: {
                name: 'Maria Lluïsa',
                email: 'maria.lluisa@example.com',
                avatarUrl: 'https://placehold.co/100/4361ee/ffffff?text=U',
                timezone: 'UTC+00:00',
                bio: ''
            },
            // Objecte per emmagatzemar les preferències de l'usuari per a l'aplicació.
            preferences: {
                theme: 'light',
                language: 'en',
                startOnDashboard: true,
                enableSounds: false,
                enableAnimations: true
            },
            // Objecte per emmagatzemar les configuracions de notificació de l'usuari.
            notifications: {
                emailTaskAssigned: true,
                emailTaskDue: true,
                emailWeeklySummary: true,
                inAppComments: true,
                inAppMentions: true,
                inAppStatusUpdates: true
            },
            // Objecte per emmagatzemar l'estat de les integracions (connectades/desconnectades).
            integrations: {
                googleCalendar: false,
                microsoftTeams: false,
                slack: false
            },
            // Llista d'opcions de fus horari per al selector.
            timezones: [
                { value: 'UTC+00:00', label: 'UTC+00:00 London' },
                { value: 'UTC-05:00', label: 'UTC-05:00 New York' },
                { value: 'UTC-08:00', label: 'UTC-08:00 Pacific Time' },
                { value: 'UTC+01:00', label: 'UTC+01:00 Paris' },
                { value: 'UTC+02:00', label: 'UTC+02:00 Cairo' },
                { value: 'UTC+03:00', label: 'UTC+03:00 Moscow' },
                { value: 'UTC+05:30', label: 'UTC+05:30 New Delhi' },
                { value: 'UTC+08:00', label: 'UTC+08:00 Singapore/Beijing' },
                { value: 'UTC+09:00', label: 'UTC+09:00 Tokyo' },
                { value: 'UTC+10:00', label: 'UTC+10:00 Sydney' }
            ],
            // Llista d'opcions d'idioma per al selector.
            languages: [
                { code: 'en', name: 'English' },
                { code: 'es', name: 'Spanish' },
                { code: 'fr', name: 'French' },
                { code: 'de', name: 'German' },
                { code: 'zh', name: 'Chinese' },
                { code: 'ja', name: 'Japanese' },
                { code: 'it', name: 'Italian' },
                { code: 'pt', name: 'Portuguese' },
                { code: 'ru', name: 'Russian' },
                { code: 'ar', name: 'Arabic' }
            ]
        };
    },
    computed: {
        // Determina el títol de la secció actual basant-se en activeSection.
        sectionTitle() {
            switch (this.activeSection) {
                case 'profile': return 'Profile Settings';
                case 'preferences': return 'Preferences';
                case 'notifications': return 'Notification Settings';
                case 'integrations': return 'Integrations';
                case 'billing': return 'Billing & Subscription';
                default: return 'Settings';
            }
        },
        // Determina si s'ha de mostrar el botó de guardar canvis.
        showSaveButton() {
            return ['profile', 'preferences', 'notifications'].includes(this.activeSection);
        }
    },
    methods: {
        // Funció per gestionar el canvi de foto de perfil.
        changeProfilePicture() {
            console.log('Changing profile picture');
            alert('Funció fora dels escensaris de ús');
        },
        // Funció per guardar les configuracions del perfil.
        saveProfile() {
            console.log('Saving profile settings:', this.user);
            alert('Profile settings saved successfully!');
        },
        // Funció genèrica per guardar les configuracions de la secció activa.
        saveSettings() {
            if (this.activeSection === 'profile') {
                this.saveProfile();
            } else {
                console.log(`Saving ${this.activeSection} settings`);
                alert(`${this.sectionTitle} saved successfully!`);
            }
        },
        // Funció per alternar l'estat d'una integració (connectar/desconnectar).
        toggleIntegration(integration) {
            this.integrations[integration] = !this.integrations[integration];
            console.log(`Toggled ${integration} integration to:`, this.integrations[integration]);

            if (this.integrations[integration]) {
                alert('Funció fora dels escensaris de ús');
            } else {
                alert(`Disconnected from ${integration}`);
            }
        },
        // Funció per gestionar l'actualització de pla de facturació.
        upgradePlan(plan) {
            console.log(`Upgrading to ${plan} plan`);
            alert('Funció fora dels escensaris de ús');
        }
    },
    mounted() {
        // Inicialitza la secció activa des dels props si s'han proporcionat.
        if (this.currentSubView) {
            this.activeSection = this.currentSubView;
        }

        console.log('Settings view component mounted with section:', this.activeSection);
    },
    watch: {
        // Observa canvis en el prop currentSubView per actualitzar la secció activa.
        currentSubView(newValue) {
            if (newValue) {
                this.activeSection = newValue;
            }
        }
    }
};