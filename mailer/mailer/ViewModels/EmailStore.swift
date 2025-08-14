import Foundation
import Observation

@Observable
final class EmailStore {
    var emails: [Email] = Email.sampleEmails
    
    func markAsRead(_ email: Email) {
        if let index = emails.firstIndex(where: { $0.id == email.id }) {
            emails[index] = Email(
                sender: emails[index].sender,
                subject: emails[index].subject,
                preview: emails[index].preview,
                date: emails[index].date,
                isRead: true,
                hasAttachment: emails[index].hasAttachment
            )
        }
    }
    
    func filteredEmails(searchText: String) -> [Email] {
        if searchText.isEmpty {
            return emails
        } else {
            return emails.filter {
                $0.sender.localizedCaseInsensitiveContains(searchText) ||
                $0.subject.localizedCaseInsensitiveContains(searchText) ||
                $0.preview.localizedCaseInsensitiveContains(searchText)
            }
        }
    }
}