const MySpace = ({ children }) => {
    return <div className="flex h-full w-full flex-col">{children}</div>
}

const Heading = ({ children, className = '', ...props }) => {
    return (
        <div className={`sticky top-0 z-20 ${className}`} {...props}>
            {children}
        </div>
    )
}

const Body = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`flex-1 bg-[#f6f6f6] px-5 pb-5 pt-4 overflow-y-auto ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}

MySpace.Heading = Heading
MySpace.Body = Body
export default MySpace