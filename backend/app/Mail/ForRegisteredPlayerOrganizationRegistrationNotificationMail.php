<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ForRegisteredPlayerOrganizationRegistrationNotificationMail extends Mailable
{
    use Queueable, SerializesModels;
    public $registered_player_mail_data;
    /**
     * Create a new message instance.
     */
    public function __construct($registered_player_mail_data)
    {
        //
        $this->registered_player_mail_data = $registered_player_mail_data;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            // subject: '[団体名]の所属選手として登録されました。',
            subject: $this->registered_player_mail_data["organization_name"] . 'の所属選手として登録されました。',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.for_registered_player_organization_registration_notification_mail',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
