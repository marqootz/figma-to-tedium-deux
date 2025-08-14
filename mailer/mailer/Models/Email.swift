import Foundation

struct Email: Identifiable, Equatable {
    let id = UUID()
    let sender: String
    let subject: String
    let preview: String
    let date: Date
    let isRead: Bool
    let hasAttachment: Bool
    
    static let sampleEmails = [
        Email(
            sender: "John Smith",
            subject: "Project Update",
            preview: "Here's the latest update on our project timeline and deliverables...",
            date: Date().addingTimeInterval(-3600),
            isRead: false,
            hasAttachment: true
        ),
        Email(
            sender: "Marketing Team",
            subject: "Weekly Newsletter",
            preview: "Check out this week's top stories and announcements...",
            date: Date().addingTimeInterval(-86400),
            isRead: true,
            hasAttachment: false
        ),
        Email(
            sender: "Sarah Johnson",
            subject: "Meeting Tomorrow",
            preview: "Don't forget about our 2 PM meeting in Conference Room B...",
            date: Date().addingTimeInterval(-172800),
            isRead: false,
            hasAttachment: false
        ),
        Email(
            sender: "Tech Support",
            subject: "Security Update Required",
            preview: "Please install the latest security patch as soon as possible...",
            date: Date().addingTimeInterval(-259200),
            isRead: true,
            hasAttachment: true
        ),
        Email(
            sender: "Alex Rodriguez",
            subject: "Vacation Request",
            preview: "I'd like to request time off for the week of July 15th...",
            date: Date().addingTimeInterval(-345600),
            isRead: true,
            hasAttachment: false
        )
    ]
}