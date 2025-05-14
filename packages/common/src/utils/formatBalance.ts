/**
 * Format balance with proper decimal places
 * @param balance The balance in smallest unit
 * @param decimals The number of decimal places
 * @returns Formatted balance string
 */
export const formatBalance = (balance: bigint, decimals: number): string => {
    const divisor = BigInt(10 ** decimals)
    const integerPart = balance / divisor
    const fractionalPart = balance % divisor
  
    // Convert fractional part to string and pad with leading zeros
    let fractionalStr = fractionalPart.toString().padStart(decimals, '0')
    // Limit to 6 decimal places and remove trailing zeros
    fractionalStr = fractionalStr.slice(0, 6).replace(/0+$/, '')
  
    return fractionalStr ? `${integerPart}.${fractionalStr}` : integerPart.toString()
}
  