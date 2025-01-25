import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiBitcoin, SiEthereum, SiSolana } from "react-icons/si";

interface ChainSelectProps {
  control: Control<any>;
}

export default function ChainSelect({ control }: ChainSelectProps) {
  return (
    <FormField
      control={control}
      name="chain"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Blockchain</FormLabel>
          <FormControl>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blockchain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ethereum">
                  <div className="flex items-center">
                    <SiEthereum className="mr-2" />
                    Ethereum
                  </div>
                </SelectItem>
                <SelectItem value="bitcoin">
                  <div className="flex items-center">
                    <SiBitcoin className="mr-2" />
                    Bitcoin
                  </div>
                </SelectItem>
                <SelectItem value="solana">
                  <div className="flex items-center">
                    <SiSolana className="mr-2" />
                    Solana
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
