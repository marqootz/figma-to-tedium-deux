import SwiftUI

struct EmailListView: View {
    @State private var emails = Email.sampleEmails
    @State private var searchText = ""
    
    var filteredEmails: [Email] {
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
    
    var body: some View {
        NavigationView {
            List(filteredEmails) { email in
                EmailRowView(email: email)
                    .onTapGesture {
                        // Mark as read when tapped
                        if let index = emails.firstIndex(where: { $0.id == email.id }) {
                            emails[index].isRead = true
                        }
                    }
            }
            .listStyle(PlainListStyle())
            .searchable(text: $searchText, prompt: "Search emails")
            .navigationTitle("Inbox")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        // Compose new email action
                    }) {
                        Image(systemName: "square.and.pencil")
                    }
                }
                
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: {
                        // Menu action
                    }) {
                        Image(systemName: "line.3.horizontal")
                    }
                }
            }
        }
    }
}