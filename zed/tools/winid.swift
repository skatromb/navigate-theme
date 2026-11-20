import CoreGraphics
import Foundation
let list = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as! [[String: Any]]
for w in list where (w["kCGWindowOwnerName"] as? String) == "Zed" && (w["kCGWindowLayer"] as? Int) == 0 {
    print(w["kCGWindowNumber"] as! Int, w["kCGWindowName"] as? String ?? "")
}
