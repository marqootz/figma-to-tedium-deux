import SwiftUI

struct EmailRowView: View {
    let email: Email
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Profile icon or initial
            Circle()
                .fill(Color.gray.opacity(0.2))
                .frame(width: 40, height: 40)
                .overlay(
                    Text(String(email.sender.prefix(1)))
                        .font(.headline)
                        .foregroundColor(.primary)
                )
            
            // Email content
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(email.sender)
                        .font(.headline)
                        .foregroundColor(email.isRead ? .secondary : .primary)
                    
                    Spacer()
                    
                    Text(email.date.formatted(date: .omitted, time: .shortened))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Text(email.subject)
                    .font(.body)
                    .fontWeight(email.isRead ? .regular : .semibold)
                    .lineLimit(1)
                
                Text(email.preview)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
            }
            
            // Attachment indicator
            if email.hasAttachment {
                Image(systemName: "paperclip")
                    .foregroundColor(.secondary)
                    .font(.caption)
            }
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 16)
    }
}